import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/smpt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.json({ accessToken: newAccessToken });
  } catch (e) {
    console.log('refreshToken error', e);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// Middleware to authenticate JWT tokens
export const authenticateToken = (
  req: Request,
  res: Response,
  next: Function,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    // @ts-ignore
    req.user = user;
    next();
  });
};
