import mongoose from 'mongoose';
import {
  schemaOptions,
  nonnegative,
  integer,
  imageUrl,
} from './schemaOptions.js';
export const stockStatusFor = (n) =>
  n === 0 ? 'OUT_OF_STOCK' : n <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
const schema = new mongoose.Schema(
  {
    partName: { type: String, required: true, trim: true, maxlength: 150 },
    partNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    unitPrice: nonnegative,
    stockQuantity: integer(0),
    description: { type: String, trim: true, default: '', maxlength: 5000 },
    imageUrl,
    imagePublicId: { type: String, select: false },
    stockStatus: {
      type: String,
      required: true,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'OUT_OF_STOCK',
    },
    revision: { type: Number, default: 0, select: false },
  },
  schemaOptions,
);
schema.pre('validate', function () {
  this.stockStatus = stockStatusFor(this.stockQuantity);
});
export default mongoose.model('SparePart', schema);
