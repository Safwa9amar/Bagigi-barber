import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  verifyConfirmationCode,
  requestNewConfirmationCode,
  savePushToken,
  updateProfile
} from '@/controllers/auth';
import { authenticateJWT } from '@/middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateJWT, logout);
router.post('/verify-confirmation-code', verifyConfirmationCode);
router.post('/request-new-confirmation-code', requestNewConfirmationCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/me', authenticateJWT, me);
router.post('/refresh-token', authenticateJWT, refreshToken);
router.post('/push-token', authenticateJWT, savePushToken);
router.post('/update-profile', authenticateJWT, updateProfile);


export default router;
