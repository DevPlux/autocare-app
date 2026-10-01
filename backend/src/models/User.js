import mongoose from 'mongoose';
import { schemaOptions } from './schemaOptions.js';
import { emailSchema } from '../utils/validationRules.js';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      validate: {
        validator: (value) => emailSchema.safeParse(value).success,
        message: 'Enter a valid email address',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: (value) =>
          /^\$2[aby]\$(?:0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/.test(value),
        message: 'Password must be stored as a bcrypt hash',
      },
    },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  schemaOptions,
);
export default mongoose.model('User', schema);
