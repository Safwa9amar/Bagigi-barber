import { NextFunction, Request, Response, Router } from 'express';
import { getById, createService, updateService, deleteService } from '@/controllers/services';
import { createReview, getServiceReviews } from '@/controllers/services/reviews';
import prisma from '@/lib/prisma';
import { authenticateJWT, isAdmin } from '@/middlewares/authMiddleware';
import { upload } from '@/config/multer';

const router = Router();

// GET /api/services
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const authUser = (req as Request & { user?: { id?: string; role?: string } }).user;
    if (!authUser?.id || !authUser.role) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: { userId?: string } = {};

    if (authUser.role === 'ADMIN') {
      where.userId = authUser.id;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          admin: {
            select: { userId: true },
          },
        },
      });

      if (!user?.admin?.userId) {
        return res.json({ data: [] });
      }

      where.userId = user.admin.userId;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    return res.json({
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', getById);

// Reviews
router.post('/:serviceId/reviews', authenticateJWT, createReview);
router.get('/:serviceId/reviews', getServiceReviews);

// Admin Routes
router.post('/', authenticateJWT, isAdmin, upload.single('image'), createService);
router.put('/:id', authenticateJWT, isAdmin, upload.single('image'), updateService);
router.delete('/:id', authenticateJWT, isAdmin, deleteService);

// Multer error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
  }
  next(err);
});

export default router;
