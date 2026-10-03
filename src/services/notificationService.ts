import { LifeAdminItem } from '../types/document';

const NOTIFIED_SESSION_KEY = 'omnivault_notified_items_v1';

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission;
}

/**
 * Checks current browser notification support and permission state
 */
export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'denied' };
  }
  return { supported: true, permission: Notification.permission };
}

/**
 * Requests browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Runs on app load or items change:
 * Checks for items with 'Upcoming' status due within 7 days,
 * and sends browser notifications for each.
 */
export function checkAndSendUpcomingReminders(items: LifeAdminItem[]): {
  notifiedCount: number;
  dueSoonItems: LifeAdminItem[];
} {
  // Find all items with 'Upcoming' status due within 7 days (0 to 7 days inclusive)
  const dueSoonItems = items.filter(item => {
    const isUpcoming = item.countdown_calculations?.status_flag === 'Upcoming';
    const days = item.countdown_calculations?.days_remaining_countdown;
    return isUpcoming && days !== null && days !== undefined && days >= 0 && days <= 7;
  });

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { notifiedCount: 0, dueSoonItems };
  }

  if (Notification.permission !== 'granted') {
    return { notifiedCount: 0, dueSoonItems };
  }

  // Load already notified items this session to prevent repeated spam
  let notifiedSet = new Set<string>();
  try {
    const stored = sessionStorage.getItem(NOTIFIED_SESSION_KEY);
    if (stored) {
      notifiedSet = new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed reading notified items session storage', e);
  }

  let notifiedCount = 0;

  dueSoonItems.forEach(item => {
    const days = item.countdown_calculations.days_remaining_countdown;
    const itemKey = `${item.id}-${days}`;

    if (!notifiedSet.has(itemKey)) {
      const daysText = days === 0 ? 'due today' : days === 1 ? 'due tomorrow' : `due in ${days} days`;
      const title = `⚠️ ${item.action_required || 'Reminder'}: ${item.document_or_event_name} (${daysText})`;
      
      const options: NotificationOptions = {
        body: `${item.user_friendly_summary}\nAction: ${item.action_required || 'Check OmniVault'}`,
        icon: '/favicon.ico',
        tag: `omnivault-${item.id}`,
      };

      try {
        new Notification(title, options);
        notifiedSet.add(itemKey);
        notifiedCount++;
      } catch (err) {
        console.error('Failed to trigger browser notification for item:', item.id, err);
      }
    }
  });

  try {
    sessionStorage.setItem(NOTIFIED_SESSION_KEY, JSON.stringify(Array.from(notifiedSet)));
  } catch (e) {
    console.error('Failed saving notified items to session storage', e);
  }

  return { notifiedCount, dueSoonItems };
}
