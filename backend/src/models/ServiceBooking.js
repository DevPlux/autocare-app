import mongoose from 'mongoose';
import { schemaOptions } from './schemaOptions.js';
import {
  isCalendarDate,
  isUtcMidnight,
  isValidTimeSlot,
} from '../utils/validationRules.js';
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    vehicleNumber: { type: String, required: true, trim: true, maxlength: 30 },
    bookingDate: {
      type: Date,
      required: true,
      // Reject impossible dates before Mongoose can roll them into next month.
      set(value) {
        if (typeof value === 'string' && !isCalendarDate(value.slice(0, 10))) {
          return new Date(NaN);
        }
        return value;
      },
      validate: {
        validator: isUtcMidnight,
        message: 'Booking date must be a valid date at UTC midnight',
      },
    },
    timeSlot: {
      type: String,
      required: true,
      validate: {
        validator: isValidTimeSlot,
        message: 'Use HH:mm-HH:mm with the slot end after its start',
      },
    },
    notes: { type: String, trim: true, default: '', maxlength: 2000 },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  schemaOptions,
);
schema.index({ serviceId: 1, bookingDate: 1, timeSlot: 1, status: 1 });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('ServiceBooking', schema);
