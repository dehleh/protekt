import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Summary } from '../core/state';
import { pulse } from '../core/state';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
const STATUS_ID = 'shomar-status';
const REMINDER_ID = 'shomar-safety-reminder';
let operations: Promise<unknown> = Promise.resolve();
let generation = 0;
function enqueue(work: () => Promise<void>) {
  const pending = operations.catch(() => {}).then(work);
  operations = pending;
  return pending;
}
export async function requestAlerts() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('warnings', { name: 'ScamCheck warnings', importance: Notifications.AndroidImportance.HIGH });
    await Notifications.setNotificationChannelAsync('status', { name: 'Last check status', importance: Notifications.AndroidImportance.LOW });
    await Notifications.setNotificationChannelAsync('reminders', { name: 'Safety check-in reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  const result = current.granted ? current : await Notifications.requestPermissionsAsync();
  return result.granted;
}
export async function notifyWarning(summary: Summary) {
  if (!['likely-scam', 'suspicious'].includes(summary.verdict)) return;
  const submittedGeneration = generation;
  return enqueue(async () => {
  if (submittedGeneration !== generation || !(await Notifications.getPermissionsAsync()).granted) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `shomar-check-${summary.id}`,
    content: { title: summary.verdict === 'likely-scam' ? 'SHOMAR: strong warning signs' : 'SHOMAR: pause and verify', body: 'Open SHOMAR to review your latest check and next steps.', data: { screen: 'Check' } },
    trigger: Platform.OS === 'android' ? { channelId: 'warnings' } : null,
  });
  });
}
export async function testAlert() {
  return enqueue(async () => { await Notifications.scheduleNotificationAsync({ content: { title: 'SHOMAR test alert', body: 'Notifications work on this device. Account monitoring is not connected.', data: { screen: 'Home' } }, trigger: Platform.OS === 'android' ? { channelId: 'warnings' } : null }); });
}
export async function updateStatusCard(enabled: boolean, summary?: Summary) {
  if (Platform.OS !== 'android') return;
  const submittedGeneration = generation;
  return enqueue(async () => {
  await Notifications.dismissNotificationAsync(STATUS_ID);
  if (!enabled || submittedGeneration !== generation || !(await Notifications.getPermissionsAsync()).granted) return;
  const status = pulse(summary);
  await Notifications.scheduleNotificationAsync({ identifier: STATUS_ID, content: { title: `SHOMAR · ${status.title}`, body: `${summary ? new Date(summary.checkedAt).toLocaleString() + '. ' : ''}Last submitted check only; no live monitoring.`, sticky: true, autoDismiss: false, data: { screen: 'Home' } }, trigger: { channelId: 'status' } });
  });
}
export async function clearNotifications() {
  generation++;
  return enqueue(async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.clearLastNotificationResponseAsync();
  });
}

export async function updateSafetyReminder(cadence: 'off' | 'weekly' | 'monthly') {
  return enqueue(async () => {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
    if (cadence === 'off' || !(await Notifications.getPermissionsAsync()).granted) return;
    const seconds = cadence === 'weekly' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: { title: 'A quick SHOMAR safety check-in', body: 'Review important accounts, family settings and anything suspicious you received.', data: { screen: 'Home' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: true, ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}) },
    });
  });
}
