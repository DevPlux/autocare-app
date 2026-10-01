import { Router } from 'express';
import controller from '../controllers/serviceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, verifyImage } from '../middleware/uploadMiddleware.js';
import {
  validate,
  validateId,
  serviceSchema,
  serviceListSchema,
  requireUpdate,
} from '../middleware/validateMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', validate(serviceListSchema, 'query'), controller.list);
router.post(
  '/',
  uploadImage,
  verifyImage,
  validate(serviceSchema),
  controller.create,
);
router.get('/:id', validateId, controller.detail);
router.put(
  '/:id',
  validateId,
  uploadImage,
  verifyImage,
  validate(serviceSchema.partial()),
  requireUpdate,
  controller.update,
);
router.delete('/:id', validateId, controller.remove);
export default router;
