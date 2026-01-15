import { Router } from 'express';
import { authenticateJWT } from '@/middlewares/authMiddleware';
import { create } from '@/controllers/booking/create';
import { estimate } from '@/controllers/booking/estimate';
import { list } from '@/controllers/booking/list';

const router = Router();

router.post('/create', authenticateJWT, create);
router.post('/estimate', estimate); // Public or Auth? estimate usually public or auth.
router.get('/my-bookings', authenticateJWT, list);

export default router;
