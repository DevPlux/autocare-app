import mongoose from 'mongoose';
import { schemaOptions, integer } from './schemaOptions.js';
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sparePartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SparePart',
      required: true,
    },
    quantity: integer(1),
    requestDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  schemaOptions,
);
schema.index({ userId: 1, createdAt: -1 });
schema.index({ sparePartId: 1 });
export default mongoose.model('PartRequest', schema);
