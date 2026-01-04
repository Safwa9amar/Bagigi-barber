import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '@/lib/smpt';

const prisma = new PrismaClient();

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
