const XLSX = require('xlsx');

/**
 * Helpers for the product bulk-import sheet.
 *
 * The import is an *upsert with change detection*: a row is matched to an
 * existing product (by `id`, else by `sku`), the sheet values are compared
 * field-by-field against what is already stored, and only genuinely different
 * fields are written. That makes "export -> tweak a few rows -> re-import" a
 * safe, idempotent round-trip: untouched rows come back as `unchanged`.
 *
 * Column names mirror the export sheet (see PRODUCT_EXPORT_HEADERS).
 */

/** Cap on how many per-row detail entries the API echoes back to the admin UI. */
const IMPORT_DETAIL_CAP = 500;

const TRUE_WORDS = new Set(['yes', 'y', 'true', 't', '1', 'active', 'enabled', 'on']);
const FALSE_WORDS = new Set(['no', 'n', 'false', 'f', '0', 'inactive', 'disabled', 'off']);

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Trimmed string, or '' for anything blank. */
function cleanString(v) {
  return isBlank(v) ? '' : String(v).trim();
}

/** Yes/No-ish cell -> boolean, or null when blank/unrecognised. */
function parseBoolean(v) {
  if (isBlank(v)) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (TRUE_WORDS.has(s)) return true;
  if (FALSE_WORDS.has(s)) return false;
  return null;
}

/** Numeric cell -> finite number, or null when blank/unparseable. */
function parseNumber(v) {
  if (isBlank(v)) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

/** Comma-separated cell -> trimmed, non-empty string array. */
function parseList(v) {
  if (isBlank(v)) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
}

/** Normalise a stored JSON column (array, JSON string or plain string) to an array. */
function toList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (isBlank(v)) return [];
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch (err) { /* not JSON — fall through to a comma split */ }
    return parseList(v);
  }
  return [];
}

/** All money/weight/GST columns are DECIMAL(_,2), so compare at 2dp. */
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const sameString = (a, b) => cleanString(a) === cleanString(b);

function sameNumber(a, b) {
  const x = isBlank(a) ? null : parseNumber(a);
  const y = isBlank(b) ? null : parseNumber(b);
  if (x === null || y === null) return x === y;
  return round2(x) === round2(y);
}

const sameOrderedList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const sameList = (a, b) => sameOrderedList(toList(a), toList(b));

function sameDimensions(current, next) {
  const a = current || {};
  const b = next || {};
  return ['length', 'width', 'height'].every((k) => sameNumber(a[k], b[k]));
}

/**
 * Sheet column -> product attribute.
 *
 * `onBlank` decides what an empty cell means when the column *is* present in
 * the header row:
 *   - 'keep'  -> leave the stored value alone (required / DB-defaulted columns)
 *   - 'null'  -> clear the field (an export writes '' exactly when it is null)
 *   - 'empty' -> clear the list
 */
const FIELD_SPECS = [
  { column: 'name', field: 'name', kind: 'string', onBlank: 'keep', required: true },
  { column: 'sku', field: 'sku', kind: 'string', onBlank: 'keep', required: true },
  { column: 'slug', field: 'slug', kind: 'string', onBlank: 'keep' },
  { column: 'category', field: 'category', kind: 'string', onBlank: 'null' },
  { column: 'brand', field: 'brand', kind: 'string', onBlank: 'null' },
  { column: 'symptom', field: 'symptom', kind: 'list', onBlank: 'empty' },
  // Prices are USD; any price_inr / compare_at_price_inr columns in a sheet are ignored
  { column: 'price_usd', field: 'price_usd', kind: 'decimal', onBlank: 'keep', required: true },
  { column: 'compare_at_price_usd', field: 'compare_at_price_usd', kind: 'decimal', onBlank: 'null' },
  { column: 'stock', field: 'stock', kind: 'integer', onBlank: 'keep' },
  { column: 'low_stock_threshold', field: 'low_stock_threshold', kind: 'integer', onBlank: 'keep' },
  { column: 'active', field: 'is_active', kind: 'boolean', onBlank: 'keep' },
  { column: 'is_best', field: 'is_best', kind: 'boolean', onBlank: 'keep' },
  { column: 'is_featured', field: 'is_featured', kind: 'boolean', onBlank: 'keep' },
  { column: 'is_trending', field: 'is_trending', kind: 'boolean', onBlank: 'keep' },
  { column: 'hsn_code', field: 'hsn_code', kind: 'string', onBlank: 'null' },
  { column: 'igst', field: 'gst_percentage', kind: 'decimal', onBlank: 'keep' },
  { column: 'weight_gm', field: 'weight', kind: 'decimal', onBlank: 'null' },
  { column: 'short_description', field: 'short_description', kind: 'string', onBlank: 'null' },
  { column: 'description', field: 'description', kind: 'string', onBlank: 'null' },
  { column: 'meta_title', field: 'meta_title', kind: 'string', onBlank: 'null' },
  { column: 'meta_description', field: 'meta_description', kind: 'string', onBlank: 'null' },
  { column: 'tags', field: 'tags', kind: 'list', onBlank: 'empty' },
];

const REQUIRED_SPECS = FIELD_SPECS.filter((spec) => spec.required);

const DIMENSION_COLUMNS = [['length', 'length_cm'], ['width', 'width_cm'], ['height', 'height_cm']];

/** Header cells are matched case/space-insensitively so hand-made sheets still work. */
function normalizeHeaderKey(header) {
  return String(header === undefined || header === null ? '' : header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

/**
 * Read a worksheet into normalised rows plus the set of columns the file
 * actually declares. Column presence — not per-cell presence — is what marks a
 * field as "managed by this import", because Excel drops emptied cells entirely.
 */
function readSheetRows(sheet) {
  const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })[0] || [];
  const columns = new Set(headerRow.map(normalizeHeaderKey).filter(Boolean));

  const rows = XLSX.utils.sheet_to_json(sheet).map((raw) => {
    const row = {};
    for (const key of Object.keys(raw)) row[normalizeHeaderKey(key)] = raw[key];
    return row;
  });

  return { columns, rows };
}

/** Resolve the dimensions JSON from the three *_cm columns. */
function resolveDimensions(row, columns, current) {
  if (!DIMENSION_COLUMNS.some(([, col]) => columns.has(col))) return null;

  const stored = current || {};
  const errors = [];
  const next = {};

  for (const [axis, col] of DIMENSION_COLUMNS) {
    // An axis whose column isn't in the sheet keeps whatever is already stored.
    if (!columns.has(col)) {
      next[axis] = parseNumber(stored[axis]);
      continue;
    }
    const raw = row[col];
    if (isBlank(raw)) {
      next[axis] = null;
      continue;
    }
    const parsed = parseNumber(raw);
    if (parsed === null) errors.push(`Invalid number in column '${col}'`);
    next[axis] = parsed;
  }

  const allEmpty = DIMENSION_COLUMNS.every(([axis]) => next[axis] === null);
  return { value: allEmpty ? null : next, errors };
}

/**
 * Images are only ever *replaced* by an import, never cleared: a blank cell
 * means "leave the gallery alone" so a stray empty column can't wipe artwork.
 */
function resolveImages(row, columns) {
  if (!columns.has('images') || isBlank(row.images)) return null;
  return parseList(row.images);
}

/** Legacy template columns, kept working for sheets built before the export existed. */
function resolveLegacyTags(row, columns) {
  if (columns.has('tags')) return null;
  if (!columns.has('treatments') && !columns.has('size')) return null;

  const tags = parseList(row.treatments);
  if (!isBlank(row.size)) tags.push(`Size: ${cleanString(row.size)}`);
  return tags;
}

function resolveLegacyGst(row, columns) {
  if (columns.has('igst')) return null;
  if (!columns.has('cgst') || !columns.has('sgst')) return null;

  const cgst = parseNumber(row.cgst);
  const sgst = parseNumber(row.sgst);
  if (cgst === null && sgst === null) return null;
  return (cgst || 0) + (sgst || 0);
}

/**
 * Diff one sheet row against an existing product, or build a fresh payload when
 * `product` is null.
 *
 * @returns {{ values: object, changes: string[], errors: string[] }}
 *   `values` holds only the attributes that actually need writing, `changes`
 *   the sheet columns responsible, and `errors` any unusable cells.
 */
function buildProductPayload(row, columns, product) {
  const isNew = !product;
  const values = {};
  const changes = [];
  const errors = [];

  const applyValue = (field, column, next, isSame) => {
    if (isNew) {
      values[field] = next;
      return;
    }
    if (isSame(product.get(field), next)) return;
    values[field] = next;
    changes.push(column);
  };

  for (const spec of FIELD_SPECS) {
    if (!columns.has(spec.column)) continue;

    const raw = row[spec.column];
    if (isBlank(raw) && spec.onBlank === 'keep') continue;

    switch (spec.kind) {
      case 'list':
        applyValue(spec.field, spec.column, parseList(raw), sameList);
        break;

      case 'boolean': {
        const parsed = parseBoolean(raw);
        if (parsed === null) {
          errors.push(`Invalid Yes/No value in column '${spec.column}'`);
          break;
        }
        applyValue(spec.field, spec.column, parsed, (a, b) => Boolean(a) === b);
        break;
      }

      case 'integer':
      case 'decimal': {
        if (isBlank(raw)) {
          applyValue(spec.field, spec.column, null, sameNumber);
          break;
        }
        const parsed = parseNumber(raw);
        if (parsed === null) {
          errors.push(`Invalid number in column '${spec.column}'`);
          break;
        }
        const next = spec.kind === 'integer' ? Math.trunc(parsed) : round2(parsed);
        applyValue(spec.field, spec.column, next, sameNumber);
        break;
      }

      default:
        applyValue(spec.field, spec.column, isBlank(raw) ? null : cleanString(raw), sameString);
    }
  }

  const dimensions = resolveDimensions(row, columns, isNew ? null : product.get('dimensions'));
  if (dimensions) {
    errors.push(...dimensions.errors);
    applyValue('dimensions', 'dimensions', dimensions.value, sameDimensions);
  }

  const legacyTags = resolveLegacyTags(row, columns);
  if (legacyTags) applyValue('tags', 'tags', legacyTags, sameList);

  const legacyGst = resolveLegacyGst(row, columns);
  if (legacyGst !== null) applyValue('gst_percentage', 'igst', round2(legacyGst), sameNumber);

  if (isNew) {
    for (const spec of REQUIRED_SPECS) {
      if (isBlank(values[spec.field])) errors.push(`Missing required value: ${spec.column}`);
    }
  }

  return { values, changes, errors };
}

module.exports = {
  IMPORT_DETAIL_CAP,
  isBlank,
  cleanString,
  parseNumber,
  readSheetRows,
  resolveImages,
  buildProductPayload,
  sameOrderedList,
};
