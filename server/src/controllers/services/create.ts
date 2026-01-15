import prisma from '@/lib/prisma';
import { NextFunction, Request, Response } from 'express';


export const createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, category, duration, priceFrom, priceTo, description, isVip, image } = req.body;
        // @ts-ignore

        const userId = req.user?.id; // Assuming authenticateJWT populates req.user
        const imagePath = req.file ? `/uploads/${req.file.filename}` : image; // Use uploaded file if present, else fallback to body

        // Debug logging
        console.log('📁 File upload debug:');
        console.log('- Content-Type:', req.headers['content-type']);
        console.log('- req.file:', req.body);

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!name || !category || !duration || !priceFrom) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const service = await prisma.service.create({
            data: {
                name,
                category,
                duration: Number(duration),
                priceFrom: Number(priceFrom),
                priceTo: priceTo ? Number(priceTo) : null,
                description,
                isVip: isVip === 'true' || isVip === true, // FormData sends strings
                is_vip: isVip === 'true' || isVip === true, // Maintain legacy/duplicate field consistency
                image: imagePath, // Keep legacy field for now
                userId
            }
        });


        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};
