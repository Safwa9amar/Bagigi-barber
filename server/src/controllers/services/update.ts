import { NextFunction, Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, category, duration, priceFrom, priceTo, description, isVip, image } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : image;

        // Check availability
        const existing = await prisma.service.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Service not found' });

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                category,
                duration: duration ? Number(duration) : undefined,
                priceFrom: priceFrom ? Number(priceFrom) : undefined,
                priceTo: priceTo ? Number(priceTo) : undefined,
                description,
                isVip: isVip !== undefined ? (isVip === 'true' || isVip === true) : undefined,
                is_vip: isVip !== undefined ? (isVip === 'true' || isVip === true) : undefined,
                image: imagePath
            }
        });

        res.json(service);
    } catch (error) {
        next(error);
    }
};
