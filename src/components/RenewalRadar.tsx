import React from 'react';
import { 
  CalendarClock, 
  CalendarPlus, 
  CreditCard, 
  Cake, 
  Shield, 
  Zap, 
  Car, 
  Fingerprint,
  AlertCircle
} from 'lucide-react';
import { LifeAdminItem, LifeAdminCategory } from '../types/document';
import { getItemStatusInfo } from '../utils/storage';
import { downloadCalendarReminder } from '../utils/calendar';

interface RenewalRadarProps {
  items: LifeAdminItem[];
  onInspect: (item: LifeAdminItem) => void;
}

export const RenewalRadar: React.FC<RenewalRadarProps> = ({
  items,
  onInspect,
}) => {
  // Sort items by nearest upcoming due date
  const upcomingItems = items
    .filter(item => item.important_dates.expiry_date_or_due_date)
    .map(item => {
      const info = getItemStatusInfo(item);
      return { item, info };
    })
    .sort((a, b) => {
      const aDays = a.info.days ?? 999999;
      const bDays = b.info.days ?? 999999;
      return aDays - bDays;
    })
    .slice(0, 6);

  if (upcomingItems.length === 0) return null;

  const getCatIcon = (cat: LifeAdminCategory) => {
    switch (cat) {
      case 'Credit Card Bill': return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      case 'Birthday/Event': return <Cake className="w-3.5 h-3.5 text-pink-400" />;
      case 'Insurance': return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Identity': return <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Warranty': return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Vehicle': return <Car className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Action & Countdown Radar
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Exact Days Remaining
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time countdown for credit card payments, birthday milestones, and policy expiries.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcomingItems.map(({ item, info }) => {
          const targetDate = item.important_dates.expiry_date_or_due_date;
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                  {getCatIcon(item.category)}
                </div>
                <div className="truncate">
                  <h4 
                    onClick={() => onInspect(item)}
                    className="text-xs font-bold text-slate-200 hover:text-emerald-400 transition cursor-pointer truncate"
                  >
                    {item.document_or_event_name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono text-slate-300">{targetDate}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{item.action_required}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${info.badgeClass}`}>
                  {info.label}
                </span>
                <button
                  onClick={() => downloadCalendarReminder(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition"
                  title="Add to Calendar (.ics)"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
