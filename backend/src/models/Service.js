import mongoose from 'mongoose';
import {
  schemaOptions,
  nonnegative,
  integer,
  imageUrl,
} from './schemaOptions.js';
const schema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    price: nonnegative,
    durationMinutes: {
      type: Number,
      required: true,
      min: Number.MIN_VALUE,
      max: Number.MAX_SAFE_INTEGER,
      validate: Number.isFinite,
    },
    description: { type: String, trim: true, default: '', maxlength: 5000 },
    imageUrl,
    imagePublicId: { type: String, select: false },
    availabilityStatus: {
      type: String,
      required: true,
      enum: ['AVAILABLE', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
    slotCapacity: integer(1, 1),
    revision: { type: Number, default: 0, select: false },
  },
  schemaOptions,
);
export default mongoose.model('Service', schema);
