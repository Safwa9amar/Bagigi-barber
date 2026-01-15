import { Router } from 'express';
import { authenticateJWT, isAdmin } from '@/middlewares/authMiddleware';
import { getStats } from '@/controllers/admin/stats';
import { list as listBookings, updateStatus as updateBookingStatus } from '@/controllers/admin/bookings';
import { list as listClients } from '@/controllers/admin/clients';
import { getWorkingDays, updateWorkingDay } from '@/controllers/admin/hours';

const router = Router();

router.get('/stats', authenticateJWT, isAdmin, getStats);
router.get('/bookings', authenticateJWT, isAdmin, listBookings);
router.patch('/bookings/:id', authenticateJWT, isAdmin, updateBookingStatus);
router.get('/clients', authenticateJWT, isAdmin, listClients);
router.get('/hours', authenticateJWT, isAdmin, getWorkingDays);
router.patch('/hours/:id', authenticateJWT, isAdmin, updateWorkingDay);

export default router;
