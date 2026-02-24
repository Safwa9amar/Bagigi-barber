import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const uploadPaymentReceipt = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Payment receipt image is required' });
  }

  try {
    const imageUrl = `/uploads/${file.filename}`;
    const note = typeof req.body?.note === 'string' ? req.body.note : null;

    const receipt = await prisma.paymentReceipt.create({
      data: {
        userId,
        imageUrl,
        note,
      },
    });

    return res.status(201).json({
      message: 'Payment receipt uploaded successfully',
      data: receipt,
    });
  } catch (error) {
    console.error('uploadPaymentReceipt error:', error);
    return res.status(500).json({ error: 'Failed to upload payment receipt' });
  }
};
