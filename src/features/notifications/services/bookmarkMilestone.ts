import { sendLocalNotification } from '@/src/features/notifications/services/notificationService';
import { storageGet, storageSet } from '@/src/core/storage/appStorage';

function keyForUser(userId: string) {
  return `notifications.bookmarkMilestone.sentAt.${userId}`;
}

export async function notifyBookmarkMilestoneIfNeeded(userId: string, bookmarkCount: number) {
  if (bookmarkCount < 5) return;
  const sentAt = await storageGet<number>(keyForUser(userId));
  if (sentAt) return;

  await sendLocalNotification({
    title: 'Nice!',
    body: 'You bookmarked 5+ courses. Want to enroll in one?',
    data: { type: 'bookmark_milestone' },
  });
  await storageSet(keyForUser(userId), Date.now());
}

