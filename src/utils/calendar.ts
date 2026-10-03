import { LifeAdminItem } from '../types/document';

/**
 * Generates an iCalendar (.ics) format string for life-admin reminders
 */
export function generateICS(item: LifeAdminItem): string {
  const targetDateStr = item.important_dates.expiry_date_or_due_date;
  if (!targetDateStr) return '';

  const dateParts = targetDateStr.split('-');
  if (dateParts.length !== 3) return '';

  const year = dateParts[0];
  const month = dateParts[1].padStart(2, '0');
  const day = dateParts[2].padStart(2, '0');

  const dtStart = `${year}${month}${day}T090000Z`;
  const dtEnd = `${year}${month}${day}T100000Z`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `omnivault-${item.id}-${Date.now()}@omnivault.ai`;

  const title = `[Reminder] ${item.action_required || 'Action Required'}: ${item.document_or_event_name}`;
  const description = `Life-Admin Reminder:\\n\\nItem: ${item.document_or_event_name}\\nCategory: ${item.category}\\nPerson: ${item.holder_or_person_name || 'N/A'}\\nID/Card: ${item.identification_numbers.primary_id || 'N/A'}\\nAmount Due: ${item.financial_details.total_amount_due || 'N/A'}\\n\\nSummary: ${item.user_friendly_summary}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OmniVault AI//Smart Life-Admin Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:OmniVault: Upcoming reminder in 7 days',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:OmniVault: Due tomorrow!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadCalendarReminder(item: LifeAdminItem) {
  const icsData = generateICS(item);
  if (!icsData) return;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(item.document_or_event_name || 'reminder').replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
