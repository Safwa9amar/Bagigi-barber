import prisma from '@/lib/prisma';
import { Request, Response } from 'express';

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await (prisma.service.findUnique as any)({
      where: {
        id,
      },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const reviewsCount = service.reviews.length;
    const averageRating = reviewsCount > 0
      ? (service.reviews as any[]).reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount
      : 0;

    // Map to match frontend expectations
    const mappedService = {
      id: service.id,
      category: service.category,
      name: service.name,
      description: service.description,
      price_from: service.priceFrom,
      price_to: service.priceTo,
      currency: 'DZD',
      duration: `${service.duration} min`,
      icon: 'cut',
      image: service.image,
      is_vip: service.is_vip || service.isVip,
      rating: averageRating,
      reviews_count: reviewsCount,
      reviews: (service.reviews as any[]).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.email.split('@')[0], // Fallback if name not available
        }
      }))
    };

    return res.status(200).json(mappedService);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
