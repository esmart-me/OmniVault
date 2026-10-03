import React from 'react';
import { 
  CreditCard, 
  Cake, 
  Shield, 
  Zap, 
  Car, 
  Fingerprint, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { LifeAdminItem, LifeAdminCategory } from '../types/document';
import { getItemStatusInfo } from '../utils/storage';

interface VaultStatsProps {
  items: LifeAdminItem[];
  selectedCategory: LifeAdminCategory | 'All';
  onSelectCategory: (cat: LifeAdminCategory | 'All') => void;
}

export const VaultStats: React.FC<VaultStatsProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
}) => {
  const categoryCounts: Record<LifeAdminCategory, number> = {
    'Credit Card Bill': 0,
    'Birthday/Event': 0,
    'Identity': 0,
    'Insurance': 0,
    'Warranty': 0,
    'Vehicle': 0,
  };

  let upcomingCount = 0;
  let overdueCount = 0;
  let activeCount = 0;

  items.forEach(item => {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
    const { status } = getItemStatusInfo(item);
    if (status === 'Upcoming') upcomingCount++;
    else if (status === 'Overdue' || status === 'Expired') overdueCount++;
    else activeCount++;
  });

  const categoriesConfig: {
    category: LifeAdminCategory;
    icon: any;
    color: string;
    description: string;
  }[] = [
    {
      category: 'Credit Card Bill',
      icon: CreditCard,
      color: 'text-amber-400',
      description: 'Total & Min Due, Due Dates',
    },
    {
      category: 'Birthday/Event',
      icon: Cake,
      color: 'text-pink-400',
      description: 'Age Milestones, Countdowns',
    },
    {
      category: 'Identity',
      icon: Fingerprint,
      color: 'text-cyan-400',
      description: 'Passports, IDs, Visas',
    },
    {
      category: 'Insurance',
      icon: Shield,
      color: 'text-emerald-400',
      description: 'Health, Life & Vehicle Policies',
    },
    {
      category: 'Warranty',
      icon: Zap,
      color: 'text-indigo-400',
      description: 'Appliances, Invoices, AMC',
    },
    {
      category: 'Vehicle',
      icon: Car,
      color: 'text-blue-400',
      description: 'RC, PUC Emission, Fitness',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* All Filter Card */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
            selectedCategory === 'All'
              ? 'bg-slate-800/95 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
              : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-emerald-400 border border-slate-700">
              {items.length}
            </span>
          </div>
          <span className="text-sm font-bold text-white">All Records</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Life-Admin Hub</span>
        </button>

        {/* 6 Category Filter Cards */}
        {categoriesConfig.map(cfg => {
          const Icon = cfg.icon;
          const count = categoryCounts[cfg.category];
          const isSelected = selectedCategory === cfg.category;

          return (
            <button
              key={cfg.category}
              onClick={() => onSelectCategory(cfg.category)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-slate-800/95 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800/80 border border-slate-700/60 ${count > 0 ? 'text-white' : 'text-slate-500'}`}>
                  {count}
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate">{cfg.category}</span>
              <span className="text-[10px] text-slate-500 truncate mt-0.5">{cfg.description}</span>
            </button>
          );
        })}
      </div>

      {/* Health & Status Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span><strong className="text-white font-semibold">{activeCount}</strong> Active Records</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span><strong className="text-amber-400 font-semibold">{upcomingCount}</strong> Upcoming &lt;30d</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span><strong className="text-rose-400 font-semibold">{overdueCount}</strong> Overdue / Expired</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Live Days Countdown Engine (Today: 2026-10-03)</span>
        </div>
      </div>
    </div>
  );
};
