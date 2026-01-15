import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (
    pushToken: string,
    title: string,
    body: string,
    data?: any
) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages = [
        {
            to: pushToken,
            sound: 'default' as const, // Fix type issue if needed, generally string is fine but 'default' is specific
            title,
            body,
            data,
        },
    ];

    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log("Push Notification Ticket:", ticketChunk);
                // Ideally handle tickets to check for errors
            } catch (error) {
                console.error("Error sending push notification chunk", error);
            }
        }
    } catch (error) {
        console.error("Error sending push notification", error);
    }
};
