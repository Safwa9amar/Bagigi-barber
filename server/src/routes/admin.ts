import { Router } from 'express';
import { authenticateJWT, isAdmin } from '@/middlewares/authMiddleware';
import { getStats } from '@/controllers/admin/stats';
import { list as listBookings, updateStatus as updateBookingStatus, createWalkIn, notifyUser } from '@/controllers/admin/bookings';
import { list as listClients, broadcast as broadcastNotification } from '@/controllers/admin/clients';
import { getWorkingDays, updateWorkingDay } from '@/controllers/admin/hours';

const router = Router();

router.get('/stats', authenticateJWT, isAdmin, getStats);
router.get('/bookings', authenticateJWT, isAdmin, listBookings);
router.post('/bookings/walk-in', authenticateJWT, isAdmin, createWalkIn);
router.patch('/bookings/:id', authenticateJWT, isAdmin, updateBookingStatus);
router.post('/bookings/:id/notify', authenticateJWT, isAdmin, notifyUser);
router.get('/clients', authenticateJWT, isAdmin, listClients);
router.post('/clients/broadcast', authenticateJWT, isAdmin, broadcastNotification);
router.get('/hours', authenticateJWT, isAdmin, getWorkingDays);
router.patch('/hours/:id', authenticateJWT, isAdmin, updateWorkingDay);

export default router;
