import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissionsAsync() {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async scheduleRetentionReminders() {
    if (Platform.OS === 'web') return;

    // 1. Cancel all existing reminders first so we don't spam the user
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Schedule 24 Hour Reminder (Keep Streak Alive)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 Keep your streak alive!",
        body: "Just 5 minutes of practice today will keep your momentum going.",
        sound: true,
      },
      trigger: {
        seconds: 24 * 60 * 60, // 24 hours
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });

    // 3. Schedule 3 Day Reminder (We miss you)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👋 We miss you!",
        body: "Don't let your Spanish skills fade. Jump in for a quick review.",
        sound: true,
      },
      trigger: {
        seconds: 3 * 24 * 60 * 60, // 3 days
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });

    // 4. Schedule 7 Day Reminder (Fluency dropping)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💔 It's been a while...",
        body: "Your fluency is dropping! Come back and earn some XP.",
        sound: true,
      },
      trigger: {
        seconds: 7 * 24 * 60 * 60, // 7 days
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  }
}
