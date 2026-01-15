import { Request, Response, Router } from 'express';
import { getById, createService, updateService, deleteService } from '@/controllers/services';
import { createReview, getServiceReviews } from '@/controllers/services/reviews';
import prisma from '@/lib/prisma';
import { authenticateJWT, isAdmin } from '@/middlewares/authMiddleware';
import { upload } from '@/config/multer';

const router = Router();

// GET /api/services
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
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
router.delete('/:id', authenticateJWT, deleteService);

// Multer error handling middleware
router.use((err: any, req: Request, res: Response, next: any) => {
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
