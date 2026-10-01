import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';
import { ApiError } from '../utils/apiResponse.js';

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudKey,
  api_secret: config.cloudSecret,
  secure: true,
});
export const imageStorage = {
  async upload(buffer, folder) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `${config.cloudFolder}/${folder}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'png', 'webp'],
            timeout: 60000,
          },
          (error, value) => (error ? reject(error) : resolve(value)),
        );
        stream.on('error', reject);
        stream.end(buffer);
      });
      return { imageUrl: result.secure_url, imagePublicId: result.public_id };
    } catch {
      throw new ApiError(502, 'Image upload failed; please try again');
    }
  },
  async remove(publicId) {
    if (publicId)
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
  },
};
export async function removeImage(storage, publicId) {
  if (!publicId) return;
  try {
    await storage.remove(publicId);
  } catch {
    console.warn('Cloudinary cleanup failed for asset:', publicId);
  }
}
export { cloudinary };
