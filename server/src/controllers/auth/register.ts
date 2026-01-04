import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/smpt';

const prisma = new PrismaClient();

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
