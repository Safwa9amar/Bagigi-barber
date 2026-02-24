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
  updateProfile,
  accessStatus,
  uploadPaymentReceipt,
} from '@/controllers/auth';
import { authenticateJWT } from '@/middlewares/authMiddleware';
import { upload } from '@/config/multer';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateJWT, logout);
router.post('/verify-confirmation-code', verifyConfirmationCode);
router.post('/request-new-confirmation-code', requestNewConfirmationCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/me', authenticateJWT, me);
router.get('/access-status', authenticateJWT, accessStatus);
router.post('/refresh-token', authenticateJWT, refreshToken);
router.post('/push-token', authenticateJWT, savePushToken);
router.post('/update-profile', authenticateJWT, updateProfile);
router.post('/upload-payment-receipt', authenticateJWT, upload.single('receipt'), uploadPaymentReceipt);


export default router;
