import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  CalendarClock,
  Sparkles
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';
import { 
  getNotificationStatus, 
  requestNotificationPermission, 
  checkAndSendUpcomingReminders 
} from '../services/notificationService';

interface NotificationBannerProps {
  items: LifeAdminItem[];
  onInspectItem: (item: LifeAdminItem) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  items,
  onInspectItem,
}) => {
  const [status, setStatus] = useState(getNotificationStatus());
  const [dismissed, setDismissed] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Find items with 'Upcoming' status due within 7 days
  const dueWithin7Days = items.filter(item => {
    const isUpcoming = item.countdown_calculations?.status_flag === 'Upcoming';
    const days = item.countdown_calculations?.days_remaining_countdown;
    return isUpcoming && days !== null && days !== undefined && days >= 0 && days <= 7;
  });

  const handleEnableNotifications = async () => {
    const newPerm = await requestNotificationPermission();
    setStatus({ supported: status.supported, permission: newPerm });
    if (newPerm === 'granted') {
      const result = checkAndSendUpcomingReminders(items);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const handleTestNotification = () => {
    if (status.permission === 'granted') {
      if (dueWithin7Days.length > 0) {
        checkAndSendUpcomingReminders(items);
      } else {
        new Notification("🔔 OmniVault Renewal Reminder", {
          body: "Renewal reminder service is active! You will be alerted 7 days before items expire.",
          icon: "/favicon.ico"
        });
      }
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      handleEnableNotifications();
    }
  };

  if (!status.supported || dismissed) return null;

  return (
    <div className="space-y-2">
      {/* 7-Day Due Urgent Alert Ribbon if items exist */}
      {dueWithin7Days.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>7-Day Renewal Service Alert</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {dueWithin7Days.length} Item{dueWithin7Days.length > 1 ? 's' : ''} Due Soon
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {dueWithin7Days[0].document_or_event_name} is{' '}
                <strong className="text-amber-100 font-bold">
                  {dueWithin7Days[0].countdown_calculations.days_remaining_countdown === 0
                    ? 'due today!'
                    : `due in ${dueWithin7Days[0].countdown_calculations.days_remaining_countdown} days`}
                </strong>{' '}
                ({dueWithin7Days[0].action_required})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onInspectItem(dueWithin7Days[0])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition"
            >
              View Details
            </button>
            {status.permission !== 'granted' ? (
              <button
                onClick={handleEnableNotifications}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-xs font-bold text-slate-950 shadow transition"
              >
                Enable Notifications
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{testSent ? 'Notification Sent!' : 'Alerts Active'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Permission Request Banner if permission is not granted */}
      {status.permission !== 'granted' && status.permission !== 'denied' && (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Enable Renewal Reminder Browser Notifications
              </p>
              <p className="text-slate-400 text-[11px]">
                OmniVault automatically checks on app load and notifies you 7 days before bills, birthdays, and policies expire.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-xs font-bold text-slate-950 transition shadow"
            >
              Allow Notifications
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
