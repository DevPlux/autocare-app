import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../utils/apiResponse.js';

const allowed = ['image/jpeg', 'image/png', 'image/webp'];
const parseImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 12,
    fieldSize: 10000,
    parts: 13,
  },
  fileFilter(_req, file, callback) {
    callback(
      allowed.includes(file.mimetype)
        ? null
        : new ApiError(400, 'Only JPEG, PNG and WebP images are allowed'),
      allowed.includes(file.mimetype),
    );
  },
}).single('image');

export function uploadImage(req, res, next) {
  parseImage(req, res, (error) => {
    if (
      error &&
      !(error instanceof multer.MulterError) &&
      !(error instanceof ApiError)
    )
      return next(new ApiError(400, 'Malformed multipart upload'));
    next(error);
  });
}

export async function verifyImage(req, _res, next) {
  if (req.file) {
    let detected;
    try {
      detected = await fileTypeFromBuffer(req.file.buffer);
    } catch {
      /* Invalid/truncated image. */
    }
    if (
      !detected ||
      !allowed.includes(detected.mime) ||
      detected.mime !== req.file.mimetype
    )
      throw new ApiError(
        400,
        'Image contents do not match a supported image type',
      );
  }
  next();
}
