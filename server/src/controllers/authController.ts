import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/smpt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export const register = async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;
  if (!email || !password || !phone)
    return res
      .status(400)
      .json({ error: 'Email, password and phone are required' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);

    // 🔹 Generate confirmation code
    const confirmationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const confirmationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // 🔹 Create user with avatar
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashed,
        emailConfirmed: false,
        confirmationCode,
        confirmationCodeExpires,
      },
    });

    // 🔹 Send confirmation email
    await sendConfirmationEmail(email, confirmationCode);

    res
      .status(201)
      .json({ message: 'User registered. Please confirm your email.' });
  } catch (e) {
    console.log('register error', e);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const verifyConfirmationCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      error: 'Email and confirmation code are required',
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.emailConfirmed) {
      return res.status(400).json({
        error: 'Email already confirmed',
      });
    }
    if (!user.confirmationCode || !user.confirmationCodeExpires) {
      return res.status(400).json({
        error: 'No confirmation code found',
      });
    }
    // ❌ Invalid code
    if (user.confirmationCode !== code) {
      return res.status(400).json({
        error: 'Invalid confirmation code',
      });
    }
    // ⏰ Expired code
    if (user.confirmationCodeExpires < new Date()) {
      return res.status(400).json({
        error: 'Confirmation code expired',
      });
    }
    // ✅ Confirm user
    await prisma.user.update({
      where: { email },
      data: {
        emailConfirmed: true,
        confirmationCode: null,
        confirmationCodeExpires: null,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
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
  } catch (error) {
    console.error('verifyConfirmationCode error', error);
    return res.status(500).json({
      error: 'Verification failed',
    });
  }
};

export const requestNewConfirmationCode = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Email is required',
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    if (user.emailConfirmed) {
      return res.status(400).json({
        error: 'Email already confirmed',
      });
    }
    // 🔒 Optional: prevent spamming (cooldown)
    if (
      user.confirmationCodeExpires &&
      user.confirmationCodeExpires > new Date(Date.now() - 2 * 60 * 1000)
    ) {
      return res.status(429).json({
        error: 'Please wait before requesting a new code',
      });
    }
    // 🔢 Generate new code
    const confirmationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const confirmationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    // 💾 Save new code
    await prisma.user.update({
      where: { email },
      data: {
        confirmationCode,
        confirmationCodeExpires,
      },
    });
    // 📧 Send email
    await sendConfirmationEmail(email, confirmationCode);

    return res.status(200).json({
      message: 'New confirmation code sent',
    });
  } catch (error) {
    console.error('requestNewConfirmationCode error', error);
    return res.status(500).json({
      error: 'Failed to send confirmation code',
    });
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
