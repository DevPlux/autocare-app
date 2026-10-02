export const success = (res, message, data, status = 200) =>
  res.status(status).json({ success: true, message, data });
export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
