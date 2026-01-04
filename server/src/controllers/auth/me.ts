import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '1h';

export const me = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    console.log('me error', e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
