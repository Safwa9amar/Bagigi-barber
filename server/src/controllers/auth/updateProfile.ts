import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // Assuming auth middleware attaches user
    const { name, phone, email, password, currentPassword, newPassword } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates: any = {};

        if (name && name !== currentUser.name) {
            updates.name = name;
        }

        if (phone && phone !== currentUser.phone) {
            updates.phone = phone;
        }

        // Email update handling (requires password confirmation)
        if (email && email !== currentUser.email) {
            if (!password) {
                return res.status(400).json({ error: 'Password is required to change email' });
            }

            const validPassword = await bcrypt.compare(password, currentUser.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Check if email is already taken
            const emailExists = await prisma.user.findUnique({
                where: { email },
            });

            if (emailExists) {
                return res.status(400).json({ error: 'Email is already in use' });
            }

            updates.email = email;
        }

        // Password update handling
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set a new password' });
            }

            const validPassword = await bcrypt.compare(currentPassword, currentUser.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Incorrect current password' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }

            updates.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(200).json({ message: 'No changes made', user: currentUser });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        // Sanitize return
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            message: 'Profile updated successfully',
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
