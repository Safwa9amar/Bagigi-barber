import prisma from '@/lib/prisma';
import { Request, Response } from 'express';

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

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
    };

    return res.status(200).json(mappedService);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
