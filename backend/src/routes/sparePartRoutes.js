import { Router } from 'express';
import controller from '../controllers/sparePartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, verifyImage } from '../middleware/uploadMiddleware.js';
import {
  validate,
  validateId,
  partSchema,
  partListSchema,
  requireUpdate,
} from '../middleware/validateMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', validate(partListSchema, 'query'), controller.list);
router.post(
  '/',
  uploadImage,
  verifyImage,
  validate(partSchema),
  controller.create,
);
router.get('/:id', validateId, controller.detail);
router.put(
  '/:id',
  validateId,
  uploadImage,
  verifyImage,
  validate(partSchema.partial()),
  requireUpdate,
  controller.update,
);
router.delete('/:id', validateId, controller.remove);
export default router;
