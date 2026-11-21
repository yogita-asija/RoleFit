export class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Unexpected server error.';
  if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'PDF is larger than 5 MB.' : 'Upload failed: ' + err.message; }
  if (err.type === 'entity.too.large') { status = 413; message = 'Request body is too large.'; }
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Request body is not valid JSON.'; }
  if (status >= 500) console.error('[error]', req.method, req.path, err.message); // never log bodies
  res.status(status).json({ error: status >= 500 && !err.status ? 'Unexpected server error.' : message });
}
