import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });
    res
      .status(201)
      .json({ message: 'User registered', id: user.id, email: user.email });
  } catch (e) {
    console.log('register error', e);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.json({ token });
  } catch (e) {
    console.log('error', e);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email });
  } catch (e) {
    console.log('me error', e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

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
    res.json({ message: 'Reset token generated', resetToken });
  } catch (e) {
    console.log('requestPasswordReset error', e);
    res.status(500).json({ error: 'Failed to generate reset token' });
  }
};

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
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    console.log('resetPassword error', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
