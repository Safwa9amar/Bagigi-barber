import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '1h';

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
      select: {
        id: true,
        adminId: true,
        email: true,
        phone: true,
        role: true,
        name: true,
        emailConfirmed: true,
        confirmationCode: true,
        confirmationCodeExpires: true,
        admin: {
          select: {
            id: true,
            code: true,
            name: true,
            barberLogo: true,
            barberLogoUri: true,
            barberLogoFile: {
              select: {
                uri: true,
                url: true,
              },
            },
          },
        },
        adminProfile: {
          select: {
            id: true,
            code: true,
            name: true,
            barberLogo: true,
            barberLogoUri: true,
            barberLogoFile: {
              select: {
                uri: true,
                url: true,
              },
            },
          },
        },
      },
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

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const admin = user.admin || user.adminProfile || null;
    const logo = admin?.barberLogoFile?.uri || admin?.barberLogoFile?.url || admin?.barberLogoUri || admin?.barberLogo || null;
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name || undefined,
        role: user.role,
        shopId: admin?.id || undefined,
        adminId: admin?.id || undefined,
        shopCode: admin?.code || undefined,
        adminCode: admin?.code || undefined,
        shopName: admin?.name || undefined,
        logo: logo || undefined,
        barberLogo: admin?.barberLogo || undefined,
        barberLogoUri: admin?.barberLogoUri || undefined,
      },
    });
  } catch (error) {
    console.error('verifyConfirmationCode error', error);
    return res.status(500).json({
      error: 'Verification failed',
    });
  }
};
