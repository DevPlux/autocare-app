import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login } from '../controllers/authController.js';
import {
  validate,
  registerSchema,
  loginSchema,
} from '../middleware/validateMiddleware.js';

const router = Router();
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      success: false,
      message: 'Too many authentication attempts; try again later',
      errors: [],
    },
  }),
);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
export default router;
