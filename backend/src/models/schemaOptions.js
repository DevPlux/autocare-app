import { isCloudinaryImageUrl } from '../utils/validationRules.js';

export const schemaOptions = {
  timestamps: true,
  strict: 'throw',
  toJSON: {
    transform(_doc, value) {
      delete value.__v;
      delete value.password;
      delete value.imagePublicId;
      delete value.revision;
      return value;
    },
  },
};
export const nonnegative = {
  type: Number,
  required: true,
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  validate: Number.isFinite,
};
export const integer = (min, defaultValue) => ({
  type: Number,
  min,
  max: Number.MAX_SAFE_INTEGER,
  required: true,
  ...(defaultValue === undefined ? {} : { default: defaultValue }),
  validate: Number.isSafeInteger,
});

export const imageUrl = {
  type: String,
  default: '',
  maxlength: 2048,
  validate: {
    validator: isCloudinaryImageUrl,
    message: 'Image URL must be a Cloudinary HTTPS image URL',
  },
};
