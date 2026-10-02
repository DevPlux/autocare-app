import { Router } from 'express';
import * as controller from '../controllers/serviceBookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  validate,
  validateId,
  bookingSchema,
  bookingStatusSchema,
  bookingListSchema,
  requireUpdate,
} from '../middleware/validateMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', validate(bookingListSchema, 'query'), controller.list);
router.post('/', validate(bookingSchema), controller.create);
router.get('/:id', validateId, controller.detail);
router.put(
  '/:id',
  validateId,
  validate(bookingSchema.partial()),
  requireUpdate,
  controller.update,
);
router.patch(
  '/:id/status',
  validateId,
  validate(bookingStatusSchema),
  controller.changeStatus,
);
router.delete('/:id', validateId, controller.remove);
export default router;
