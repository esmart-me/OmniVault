import { 
  LifeAdminItem, 
  RecurrenceFrequency, 
  PaymentRecord, 
  StatusFlag 
} from '../types/document';

const TODAY_DATE_STR = '2026-10-03';

/**
 * Calculates the next billing date based on user-defined frequency
 */
export function calculateNextDueDate(
  currentDueDateStr: string,
  frequency: RecurrenceFrequency
): string {
  if (!currentDueDateStr || frequency === 'none') {
    return currentDueDateStr;
  }

  // Parse YYYY-MM-DD
  const parts = currentDueDateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return currentDueDateStr;
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly': {
      const targetMonth = date.getMonth() + 1;
      date.setMonth(targetMonth);
      // Handle month overflow (e.g. Jan 31 -> Feb 28)
      if (date.getMonth() !== targetMonth % 12) {
        date.setDate(0);
      }
      break;
    }
    case 'quarterly': {
      const targetMonth = date.getMonth() + 3;
      date.setMonth(targetMonth);
      if (date.getMonth() !== targetMonth % 12) {
        date.setDate(0);
      }
      break;
    }
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

/**
 * Computes days remaining and status flag against current system date
 */
export function computeCountdownAndStatus(
  dueDateStr: string | null,
  referenceDateStr = TODAY_DATE_STR
): { days: number | null; status: StatusFlag } {
  if (!dueDateStr) {
    return { days: null, status: 'Active' };
  }

  const due = new Date(dueDateStr);
  const ref = new Date(referenceDateStr);

  if (isNaN(due.getTime()) || isNaN(ref.getTime())) {
    return { days: null, status: 'Active' };
  }

  const diffTime = due.getTime() - ref.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: StatusFlag = 'Active';
  if (days < 0) {
    status = 'Overdue';
  } else if (days <= 30) {
    status = 'Upcoming';
  } else {
    status = 'Active';
  }

  return { days, status };
}

/**
 * Automatically advances a recurring bill to its next cycle and updates status
 */
export function advanceRecurringBill(
  item: LifeAdminItem,
  paymentDetails?: { amount?: string; utr?: string }
): LifeAdminItem {
  const currentFrequency = item.recurring?.frequency || item.financial_details?.recurring?.frequency || 'monthly';
  const currentDueDate = item.important_dates.expiry_date_or_due_date || TODAY_DATE_STR;

  const nextDueDate = calculateNextDueDate(currentDueDate, currentFrequency);
  const { days, status } = computeCountdownAndStatus(nextDueDate);

  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    paid_date: TODAY_DATE_STR,
    amount: paymentDetails?.amount || item.financial_details.total_amount_due || '₹0',
    utr: paymentDetails?.utr || 'Auto-advanced',
    cycle_due_date: currentDueDate,
  };

  const existingHistory = item.recurring?.payment_history || item.financial_details?.recurring?.payment_history || [];
  const updatedHistory = [paymentRecord, ...existingHistory];

  const updatedItem: LifeAdminItem = {
    ...item,
    important_dates: {
      ...item.important_dates,
      issue_date_or_dob: currentDueDate, // previous cycle
      expiry_date_or_due_date: nextDueDate, // next scheduled cycle
    },
    countdown_calculations: {
      days_remaining_countdown: days,
      status_flag: status,
    },
    action_required: days !== null && days <= 7 
      ? `Pay next ${currentFrequency} bill by ${nextDueDate}` 
      : `Next cycle due on ${nextDueDate}`,
    user_friendly_summary: `${item.document_or_event_name} recurring (${currentFrequency}). Next instance scheduled for ${nextDueDate}.`,
    recurring: {
      frequency: currentFrequency,
      auto_schedule_next: true,
      last_paid_date: TODAY_DATE_STR,
      payment_history: updatedHistory,
    },
    financial_details: {
      ...item.financial_details,
      recurring: {
        frequency: currentFrequency,
        auto_schedule_next: true,
        last_paid_date: TODAY_DATE_STR,
        payment_history: updatedHistory,
      },
    },
    updated_at: new Date().toISOString(),
  };

  return updatedItem;
}

/**
 * Returns a list of forecasted future occurrences for a bill
 */
export function getFutureOccurrences(
  dueDateStr: string,
  frequency: RecurrenceFrequency,
  count = 3
): string[] {
  if (!dueDateStr || frequency === 'none') return [];
  const occurrences: string[] = [];
  let curr = dueDateStr;

  for (let i = 0; i < count; i++) {
    curr = calculateNextDueDate(curr, frequency);
    occurrences.push(curr);
  }

  return occurrences;
}

/**
 * Calculates monthly run-rate and annual projected spend for all recurring bills
 */
export function getProjectedFinancialRunRate(items: LifeAdminItem[]): {
  monthlyRunRate: number;
  annualProjected: number;
  recurringCount: number;
} {
  let monthlyTotal = 0;
  let recurringCount = 0;

  items.forEach(item => {
    const freq = item.recurring?.frequency || item.financial_details?.recurring?.frequency;
    const isRecurring = freq && freq !== 'none';
    const isBill = item.category === 'Credit Card Bill' || isRecurring || Boolean(item.financial_details.total_amount_due);

    if (isRecurring && item.financial_details.total_amount_due) {
      const cleaned = item.financial_details.total_amount_due.replace(/[^0-9.]/g, '');
      const amount = parseFloat(cleaned);

      if (!isNaN(amount) && amount > 0) {
        recurringCount++;
        switch (freq) {
          case 'weekly':
            monthlyTotal += amount * 4.33;
            break;
          case 'monthly':
            monthlyTotal += amount;
            break;
          case 'quarterly':
            monthlyTotal += amount / 3;
            break;
          case 'yearly':
            monthlyTotal += amount / 12;
            break;
        }
      }
    }
  });

  return {
    monthlyRunRate: Math.round(monthlyTotal),
    annualProjected: Math.round(monthlyTotal * 12),
    recurringCount,
  };
}

/**
 * Automatically evaluates items on app launch:
 * If an item is a recurring subscription and its current due date is overdue,
 * recalculates its countdown or flags for renewal.
 */
export function checkAndRefreshRecurringItems(items: LifeAdminItem[]): LifeAdminItem[] {
  let hasChanges = false;
  const updated = items.map(item => {
    const freq = item.recurring?.frequency || item.financial_details?.recurring?.frequency;
    if (freq && freq !== 'none' && item.important_dates.expiry_date_or_due_date) {
      const { days, status } = computeCountdownAndStatus(item.important_dates.expiry_date_or_due_date);
      if (
        days !== item.countdown_calculations.days_remaining_countdown ||
        status !== item.countdown_calculations.status_flag
      ) {
        hasChanges = true;
        return {
          ...item,
          countdown_calculations: {
            days_remaining_countdown: days,
            status_flag: status,
          },
        };
      }
    }
    return item;
  });

  return hasChanges ? updated : items;
}
