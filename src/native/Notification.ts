import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { NotificationData } from '../Types';
import { SchedulableTriggerInputTypes } from 'expo-notifications';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    }as any),
});

async function registerForPushNotificationsAsync() {
    let token;

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
            alert('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}


export default class Notification {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
    channels: Notifications.NotificationChannel[];
    notification: Notifications.Notification;
    token: any;
    event: { remove: () => void }[];
    constructor() {


        registerForPushNotificationsAsync().then(token => token && (this.token = token));

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(value => this.channels = value);
        }

        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            this.notification = notification;
        });

        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            let data = response.notification.request.content.data as NotificationData;
            try {
                switch (data?.type) {
                    case "File":
                        //    IntentLauncher.startActivityAsync("android.intent.action.VIEW", {data: `file://${data.data}`.toLowerCase()});
                        break;
                }
            } catch (e) {
                console.error(e)
            }
            // console.warn([response.notification].niceJson());
        });

        this.event = [
            this.responseListener,
            this.notificationListener,
        ]

    }

    async push(title: string, body: string, data?: NotificationData) {
        await Notifications.scheduleNotificationAsync({
            content: {

                title: title,
                body: body,
                data: data,
            },
            trigger: { seconds: 1, type: SchedulableTriggerInputTypes.CALENDAR },
        });
    }

}