/**
 * Save an axios blob response as a file download.
 * Uses the server's Content-Disposition filename when it's readable,
 * otherwise falls back to the supplied name.
 */
export function downloadBlobResponse(response, fallbackName) {
  const disposition = response.headers?.['content-disposition'] || '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const filename = match ? decodeURIComponent(match[1]) : fallbackName;

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so the download has definitely started
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Error responses for a blob request arrive as a Blob, not JSON — read it back
 * so the real API message can be surfaced instead of a generic failure.
 */
export async function readBlobError(err, fallbackMessage) {
  const body = err?.data ?? err?.response?.data;
  if (body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text());
      if (parsed?.message) return parsed.message;
    } catch {
      /* not JSON — fall through */
    }
  }
  return err?.message || fallbackMessage;
}
