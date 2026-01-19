import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export const resetPassword = async (req: Request, res: Response) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword)
    return res.status(400).json({ error: 'All fields required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.resetToken !== resetToken ||
      !user.resetTokenExp ||
      user.resetTokenExp < new Date()
    ) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e) {
    console.log('resetPassword error', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
