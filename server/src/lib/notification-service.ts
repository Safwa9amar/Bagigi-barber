import prisma from './prisma';
import { sendPushNotification } from './push';

/**
 * Notifies all administrators with a push notification.
 */
export async function notifyAdmins(title: string, body: string, data?: any) {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN',
                pushToken: { not: null }
            },
            select: { pushToken: true }
        });

        const tokens = admins.map(a => a.pushToken).filter(Boolean) as string[];

        if (tokens.length === 0) {
            console.log('[NotificationService] No admins with push tokens found');
            return;
        }

        console.log(`[NotificationService] Sending push to ${tokens.length} admins: "${title}"`);

        // We can optimize sendPushNotification to accept multiple tokens, 
        // but for now we'll call it for each to keep it simple and reuse existing logic.
        for (const token of tokens) {
            await sendPushNotification(token, title, body, data);
        }
    } catch (error) {
        console.error('[NotificationService] Error notifying admins:', error);
    }
}

/**
 * Notifies a specific user with a push notification.
 */
export async function notifyUser(userId: string, title: string, body: string, data?: any) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true }
        });

        if (user?.pushToken) {
            console.log(`[NotificationService] Notifying user ${userId} (${title})`);
            await sendPushNotification(user.pushToken, title, body, data);
            console.log(`[NotificationService] Push sent to user ${userId}`);
        } else {
            console.log(`[NotificationService] User ${userId} has no push token`);
        }
    } catch (error) {
        console.error(`[NotificationService] Error notifying user ${userId}:`, error);
    }
}

/**
 * Broadcasts a notification to all users with a push token.
 */
export async function broadcastNotification(title: string, body: string, data?: any) {
    try {
        const users = await prisma.user.findMany({
            where: {
                pushToken: { not: null }
            },
            select: { pushToken: true }
        });

        const tokens = users.map(u => u.pushToken).filter(Boolean) as string[];

        console.log(`Broadcasting push to ${tokens.length} users: ${title}`);

        for (const token of tokens) {
            await sendPushNotification(token, title, body, data);
        }
    } catch (error) {
        console.error('Error broadcasting notification:', error);
    }
}
