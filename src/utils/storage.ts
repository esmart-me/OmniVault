import { LifeAdminItem } from '../types/document';
import { SAMPLE_LIFE_ADMIN_PRESETS } from '../data/sampleDocuments';

const STORAGE_KEY = 'omnivault_life_admin_v2';
const TODAY_REF = '2026-10-03';

export function getInitialLifeAdminItems(): LifeAdminItem[] {
  let items: LifeAdminItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load items from localStorage', e);
  }

  // Seed with realistic life-admin presets
  if (items.length === 0) {
    items = SAMPLE_LIFE_ADMIN_PRESETS.map((sample, idx) => ({
      ...sample.expected_extraction,
      id: `seed-item-${idx + 1}-${Date.now()}`,
      created_at: new Date(Date.now() - idx * 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      raw_input_text: sample.raw_text,
      file_type: sample.entry_type === 'Scanned Document' ? 'pdf' : 'text',
      file_name: `${sample.title}.txt`,
      notes: `Pre-loaded ${sample.category} record`,
      verified_by_user: true,
    }));
    saveLifeAdminItems(items);
  } else {
    // Ensure at least one 7-day upcoming item is available for immediate notification testing
    const hasDueWithin7 = items.some(i => {
      const days = i.countdown_calculations?.days_remaining_countdown;
      return i.countdown_calculations?.status_flag === 'Upcoming' && days !== null && days >= 0 && days <= 7;
    });
    if (!hasDueWithin7) {
      const utilityPreset = SAMPLE_LIFE_ADMIN_PRESETS.find(p => p.id === 'sample-electricity-bill');
      if (utilityPreset) {
        items.unshift({
          ...utilityPreset.expected_extraction,
          id: `seed-item-electricity-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          raw_input_text: utilityPreset.raw_text,
          file_type: 'pdf',
          file_name: `${utilityPreset.title}.txt`,
          notes: 'Pre-loaded 4-day upcoming reminder test item',
          verified_by_user: true,
        });
        saveLifeAdminItems(items);
      }
    }
  }

  return items;
}

export function saveLifeAdminItems(items: LifeAdminItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items to localStorage', e);
  }
}

export function getItemStatusInfo(item: LifeAdminItem): {
  days: number | null;
  status: 'Active' | 'Expired' | 'Overdue' | 'Upcoming';
  badgeClass: string;
  label: string;
} {
  const targetDateStr = item.important_dates.expiry_date_or_due_date;
  if (!targetDateStr) {
    return {
      days: null,
      status: 'Active',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      label: 'Permanent / Lifetime',
    };
  }

  const target = new Date(targetDateStr);
  const today = new Date(TODAY_REF);
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const isBill = item.category === 'Credit Card Bill';
    return {
      days: diffDays,
      status: isBill ? 'Overdue' : 'Expired',
      badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse',
      label: `${isBill ? 'Overdue' : 'Expired'} (${Math.abs(diffDays)}d ago)`,
    };
  }

  if (diffDays <= 7) {
    return {
      days: diffDays,
      status: 'Upcoming',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse',
      label: diffDays === 0 ? 'Due Today!' : diffDays === 1 ? 'Due Tomorrow!' : `Due in ${diffDays} days!`,
    };
  }

  if (diffDays <= 30) {
    return {
      days: diffDays,
      status: 'Upcoming',
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      label: `In ${diffDays} days`,
    };
  }

  return {
    days: diffDays,
    status: 'Active',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    label: `${diffDays} days left`,
  };
}

export function exportLifeAdminJSON(items: LifeAdminItem[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `omnivault_life_admin_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
