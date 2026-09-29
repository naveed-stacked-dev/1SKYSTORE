const XLSX = require('xlsx');

/**
 * Hard ceiling on rows in a single export, so a filter-less export of a huge
 * table can't exhaust memory. Admins can narrow filters to get the rest.
 */
const EXPORT_ROW_CAP = 20000;

/**
 * Sequelize DECIMAL columns come back as strings — turn them into real numbers
 * so spreadsheet cells are numeric, and leave blanks blank.
 */
function toNumber(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  return Number.isFinite(num) ? num : '';
}

/**
 * Format a date for a spreadsheet cell (local, second precision).
 */
function toDateString(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Build an .xlsx buffer from flat row objects. Column order follows the keys of
 * the first row; an empty export still produces a valid sheet with headers.
 */
function buildWorkbookBuffer(rows, sheetName = 'Sheet1', headers) {
  const columns = headers || (rows.length > 0 ? Object.keys(rows[0]) : []);
  const sheet = XLSX.utils.json_to_sheet(rows, { header: columns });

  // Rough auto-width so the file is readable without manual resizing
  sheet['!cols'] = columns.map((col) => {
    const widest = rows.reduce((max, row) => {
      const len = String(row[col] ?? '').length;
      return len > max ? len : max;
    }, col.length);
    return { wch: Math.min(Math.max(widest + 2, 10), 50) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Send an .xlsx buffer as a file download.
 */
function sendWorkbook(res, filenameBase, buffer) {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenameBase}-${stamp}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  // Browsers can't read Content-Disposition cross-origin unless it's exposed
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Content-Length', buffer.length);
  return res.send(buffer);
}

module.exports = { EXPORT_ROW_CAP, toNumber, toDateString, buildWorkbookBuffer, sendWorkbook };
