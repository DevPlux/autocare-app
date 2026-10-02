import multer from 'multer';
import { ApiError } from '../utils/apiResponse.js';

export function notFound(_req, _res, next) {
  next(new ApiError(404, 'Endpoint not found'));
}
export function errorHandler(error, _req, res, _next) {
  let status = error instanceof ApiError ? error.status : 500;
  let message =
    error instanceof ApiError ? error.message : 'Internal server error';
  let errors = error instanceof ApiError ? error.errors : [];
  if (error.code === 11000) {
    status = 409;
    message = 'A record with this unique value already exists';
  }
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid field value';
  }
  if (error.name === 'StrictModeError') {
    status = 400;
    message = 'Unknown field is not allowed';
    errors = [{ field: error.path, message: 'This field is not allowed' }];
  }
  if (error instanceof multer.MulterError) {
    status = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5 MB or smaller'
        : 'Invalid multipart upload; use one image field';
  }
  if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON request';
  }
  if (error.type === 'entity.too.large') {
    status = 400;
    message = 'Request body is too large';
  }
  if (
    error.type === 'encoding.unsupported' ||
    error.type === 'charset.unsupported'
  ) {
    status = 400;
    message = 'Unsupported request encoding';
  }
  if (status >= 500) console.error('Request failed:', error.name || 'Error');
  res.status(status).json({ success: false, message, errors });
}
