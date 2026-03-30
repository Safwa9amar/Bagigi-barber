import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// expo-notifications remote push support was removed from Expo Go in SDK 53.
// We guard the import so the app doesn't crash when running in Expo Go.
const isExpoGo = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications');

        Notifications!.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (e) {
        console.warn('expo-notifications not available:', e);
    }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    // Skip entirely in Expo Go — not supported since SDK 53.
    if (isExpoGo || !Notifications) {
        console.log('Push notifications skipped: running in Expo Go.');
        return undefined;
    }

    let token: string | undefined;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return undefined;
        }

        try {
            const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Expo Push Token:', token);
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
