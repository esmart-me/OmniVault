import React from 'react';
import { 
  Home, 
  CalendarClock, 
  Plus, 
  MessageSquareText, 
  User, 
  Sparkles,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: 'vault' | 'radar' | 'finance';
  onSelectTab: (tab: 'vault' | 'radar' | 'finance') => void;
  onOpenIngest: () => void;
  onOpenChat: () => void;
  onOpenAuth: () => void;
  upcomingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenIngest,
  onOpenChat,
  onOpenAuth,
  upcomingCount,
}) => {
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {/* Vault / Home */}
        <button
          onClick={() => onSelectTab('vault')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
            activeTab === 'vault' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Vault</span>
        </button>

        {/* Radar / Countdowns */}
        <button
          onClick={() => onSelectTab('radar')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
            activeTab === 'radar' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px]">Radar</span>
          {upcomingCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        {/* Central Add Action Button */}
        <button
          onClick={onOpenIngest}
          className="flex flex-col items-center -mt-5"
          aria-label="Add Item"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 p-[2px] shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Plus className="w-6 h-6 text-emerald-400 stroke-[3]" />
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-300 mt-0.5">Add</span>
        </button>

        {/* AI Chat */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-400 hover:text-cyan-400 transition"
        >
          <MessageSquareText className="w-5 h-5" />
          <span className="text-[10px]">Ask AI</span>
        </button>

        {/* Account / Google Sign-in */}
        <button
          onClick={onOpenAuth}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-5 h-5 rounded-full border border-emerald-400 object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px]">{user ? 'Account' : 'Login'}</span>
        </button>
      </div>
    </div>
  );
};
