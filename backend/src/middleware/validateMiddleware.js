import { z } from 'zod';
import { ApiError } from '../utils/apiResponse.js';
import {
  emailSchema,
  isCalendarDate,
  isValidTimeSlot,
  timeSlotPattern,
} from '../utils/validationRules.js';

const text = (max) => z.string().trim().min(1).max(max);
const number = (minimum, integer = false) =>
  z.preprocess(
    (value) => {
      if (
        typeof value === 'string' &&
        /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())
      ) {
        return Number(value.trim());
      }
      return value;
    },
    integer
      ? z.number().int().min(minimum).max(Number.MAX_SAFE_INTEGER)
      : z.number().min(minimum).max(Number.MAX_SAFE_INTEGER),
  );
export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Must be a MongoDB ObjectId');
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine(isCalendarDate, 'Invalid calendar date')
  .transform((value) => new Date(`${value}T00:00:00.000Z`));
const timeSlot = z
  .string()
  .regex(timeSlotPattern, 'Use HH:mm-HH:mm (24-hour time)')
  .refine(isValidTimeSlot, 'Slot end must be after slot start');
const password = z
  .string()
  .min(8)
  .refine((value) => value.trim().length > 0, 'Password cannot be blank')
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must be at most 72 UTF-8 bytes',
  );
export const registerSchema = z.strictObject({
  name: text(100),
  email: emailSchema,
  password,
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const serviceSchema = z.strictObject({
  serviceName: text(150),
  category: text(100),
  price: number(0),
  durationMinutes: number(Number.MIN_VALUE),
  description: z.string().trim().max(5000).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
  slotCapacity: number(1, true).optional(),
});
export const partSchema = z.strictObject({
  partName: text(150),
  partNumber: text(100),
  category: text(100),
  unitPrice: number(0),
  stockQuantity: number(0, true),
  description: z.string().trim().max(5000).optional(),
});
export const bookingSchema = z.strictObject({
  serviceId: objectId,
  vehicleNumber: text(30),
  bookingDate: date,
  timeSlot,
  notes: z.string().trim().max(2000).optional(),
});
export const requestSchema = z.strictObject({
  sparePartId: objectId,
  quantity: number(1, true),
});
export const bookingStatusSchema = z.strictObject({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});
export const requestStatusSchema = z.strictObject({
  status: z.enum(['PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED']),
});
export const listSchema = z.strictObject({
  page: number(1, true)
    .refine((n) => n <= 1000000, 'Maximum page is 1000000')
    .optional(),
  limit: number(1, true)
    .refine((n) => n <= 100, 'Maximum limit is 100')
    .optional(),
});
export const catalogListSchema = listSchema.extend({
  category: text(100).optional(),
  search: text(100).optional(),
});
export const serviceListSchema = catalogListSchema.extend({
  availabilityStatus: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
});
export const partListSchema = catalogListSchema.extend({
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
});
export const bookingListSchema = listSchema.extend({
  status: bookingStatusSchema.shape.status.optional(),
});
export const requestListSchema = listSchema.extend({
  status: requestStatusSchema.shape.status.optional(),
});

export const validate =
  (schema, location = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success)
      return next(
        new ApiError(
          400,
          'Validation failed',
          result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        ),
      );
    if (location === 'query') req.filters = result.data;
    else req[location] = result.data;
    next();
  };
export const validateId = validate(z.object({ id: objectId }), 'params');
export const requireUpdate = (req, _res, next) =>
  Object.keys(req.body).length || req.file
    ? next()
    : next(new ApiError(400, 'Provide at least one editable field or image'));
