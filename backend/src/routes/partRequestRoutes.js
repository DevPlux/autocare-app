import { Router } from 'express';
import * as controller from '../controllers/partRequestController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  validate,
  validateId,
  requestSchema,
  requestStatusSchema,
  requestListSchema,
  requireUpdate,
} from '../middleware/validateMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', validate(requestListSchema, 'query'), controller.list);
router.post('/', validate(requestSchema), controller.create);
router.get('/:id', validateId, controller.detail);
router.put(
  '/:id',
  validateId,
  validate(requestSchema.partial()),
  requireUpdate,
  controller.update,
);
router.patch(
  '/:id/status',
  validateId,
  validate(requestStatusSchema),
  controller.changeStatus,
);
router.delete('/:id', validateId, controller.remove);
export default router;
