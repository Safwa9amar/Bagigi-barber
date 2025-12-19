import { Router } from 'express';
import { register, login, me, requestPasswordReset, resetPassword } from '@/controllers/authController';
import { authenticateJWT } from '@/middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, me);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
