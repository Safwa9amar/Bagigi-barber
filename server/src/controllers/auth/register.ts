import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/smpt';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { email, password, phone, adminCode } = req.body;
  if (!email || !password || !phone || !adminCode)
    return res
      .status(400)
      .json({ error: 'Email, password, phone and adminCode are required' });
  try {
    const admin = await prisma.admin.findUnique({
      where: { code: String(adminCode).trim().toUpperCase() },
      select: { id: true },
    });
    if (!admin) {
      return res.status(404).json({ error: 'Invalid admin code' });
    }

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
        adminId: admin.id,
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

    // 🔹 Notify Admins of new signup
    const { notifyAdmins } = await import('@/lib/notification-service');
    await notifyAdmins(
      'New User Signup! 👤',
      `A new user (${email}) just registered.`
    );

    res
      .status(201)
      .json({ message: 'User registered. Please confirm your email.' });
  } catch (e) {
    console.log('register error', e);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const listAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        barberLogo: true,
        barberLogoUri: true,
        barberLogoFile: {
          select: {
            id: true,
            uri: true,
            url: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            services: {
              where: {
                image: {
                  not: null,
                },
              },
              select: {
                image: true,
                isVip: true,
                is_vip: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: admins.map((a) => {
        const vipImage =
          a.user.services.find((s) => s.isVip || s.is_vip)?.image || null;
        const fallbackImage = a.user.services[0]?.image || null;
        const logoFromFile = a.barberLogoFile?.uri || a.barberLogoFile?.url || null;

        return {
          id: a.id,
          code: a.code,
          name: a.name || a.user.name || a.user.email,
          logo: logoFromFile || a.barberLogoUri || a.barberLogo || vipImage || fallbackImage,
          barberLogoUri: a.barberLogoUri,
          barberLogoFileId: a.barberLogoFile?.id || null,
        };
      }),
    });
  } catch (e) {
    console.log('listAdmins error', e);
    return res.status(500).json({ error: 'Failed to fetch admins' });
  }
};
