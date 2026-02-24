import { Router } from 'express';
import { authenticateJWT, isAdmin } from '@/middlewares/authMiddleware';
import {
  cancelSubscription,
  getMySubscription,
  subscribe,
} from '@/controllers/subscriptions';

const router = Router();

router.get('/me', authenticateJWT, isAdmin, getMySubscription);
router.post('/subscribe', authenticateJWT, isAdmin, subscribe);
router.post('/cancel', authenticateJWT, isAdmin, cancelSubscription);

export default router;
