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

        // Build update data object, only including defined values
        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (duration !== undefined && duration !== '') updateData.duration = Number(duration);
        if (priceFrom !== undefined && priceFrom !== '') updateData.priceFrom = Number(priceFrom);
        if (priceTo !== undefined && priceTo !== '') updateData.priceTo = Number(priceTo);
        if (description !== undefined) updateData.description = description;
        if (imagePath !== undefined) updateData.image = imagePath;
        
        if (isVip !== undefined) {
            const vipValue = isVip === 'true' || isVip === true;
            updateData.isVip = vipValue;
            updateData.is_vip = vipValue;
        }

        const service = await prisma.service.update({
            where: { id },
            data: updateData
        });

        res.json(service);
    } catch (error) {
        next(error);
    }
};
