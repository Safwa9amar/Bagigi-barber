import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const me = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    const admin = user.admin || user.adminProfile || null;
    const logo = admin?.barberLogoFile?.uri || admin?.barberLogoFile?.url || admin?.barberLogoUri || admin?.barberLogo || null;
    res.json({
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
    });
  } catch (e) {
    console.log('me error', e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
