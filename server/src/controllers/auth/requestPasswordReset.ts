import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '@/lib/smpt';

const prisma = new PrismaClient();

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExp = new Date(Date.now() + 1000 * 60 * 15); // 15 min
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExp },
    });
    // In production, send email here
    sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'Reset token generated', resetToken });
  } catch (e) {
    console.log('requestPasswordReset error', e);
    res.status(500).json({ error: 'Failed to generate reset token' });
  }
};
