import prisma from '@/lib/prisma';
import { Request, Response } from 'express';

export const createReview = async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { serviceId } = req.params

    if (role !== 'USER') {
        return res.status(403).json({ error: 'Only customers can leave reviews' });
    }

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
        // Check if service exists
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Check if user already reviewed
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_serviceId: {
                    userId,
                    serviceId
                }
            }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this service' });
        }

        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                userId,
                serviceId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        return res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getServiceReviews = async (req: Request, res: Response) => {
    const { serviceId } = (req as any).params;

    try {
        const reviews = await prisma.review.findMany({
            where: { serviceId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
