import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '1h';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        phone: true,
        role: true,
        name: true,
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const admin = user.admin || user.adminProfile || null;
    const logo = admin?.barberLogoFile?.uri || admin?.barberLogoFile?.url || admin?.barberLogoUri || admin?.barberLogo || null;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
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
  } catch (e) {
    console.log('error', e);
    res.status(500).json({ error: 'Login failed' });
  }
};
