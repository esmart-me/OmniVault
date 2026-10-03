import React from 'react';
import { 
  Sparkles, 
  Plus, 
  MessageSquareText, 
  Download, 
  BellRing,
  RotateCcw,
  CalendarCheck,
  CreditCard,
  HeartPulse,
  Eye,
  EyeOff,
  User,
  Cloud,
  ShieldCheck,
  Lock,
  FileDown,
  ShieldAlert
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';
import { exportLifeAdminJSON, getItemStatusInfo } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  items: LifeAdminItem[];
  privacyMode: boolean;
  isLockActive: boolean;
  onTogglePrivacy: () => void;
  onOpenSecuritySettings: () => void;
  onLockNow: () => void;
  onOpenPdfReport: () => void;
  onOpenAdminDashboard: () => void;
  onOpenIngest: () => void;
  onOpenGlobalChat: () => void;
  onOpenFinanceHub: () => void;
  onOpenEmergencyHub: () => void;
  onOpenAuth: () => void;
  onResetSamples: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  items,
  privacyMode,
  isLockActive,
  onTogglePrivacy,
  onOpenSecuritySettings,
  onLockNow,
  onOpenPdfReport,
  onOpenAdminDashboard,
  onOpenIngest,
  onOpenGlobalChat,
  onOpenFinanceHub,
  onOpenEmergencyHub,
  onOpenAuth,
  onResetSamples,
}) => {
  const { user } = useAuth();

  const upcomingCount = items.filter(item => {
    const { status, days } = getItemStatusInfo(item);
    return status === 'Upcoming' || (days !== null && days >= 0 && days <= 30);
  }).length;

  return (
    <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-emerald-400 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                OmniVault <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Pro</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400" /> AI Life-Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Documents • Bills • Milestones • Google Cloud Sync
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Pro Feature: Privacy Mask Toggle */}
          <button
            onClick={onTogglePrivacy}
            className={`p-2 rounded-xl border transition ${
              privacyMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={privacyMode ? 'Privacy Mode ON (Masked IDs & Amounts)' : 'Turn ON Privacy Mode'}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Pro Feature: Security Lock / PIN */}
          <button
            onClick={() => {
              if (isLockActive) onLockNow();
              else onOpenSecuritySettings();
            }}
            className={`p-2 rounded-xl border transition ${
              isLockActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isLockActive ? 'Lock App Now (Click to Lock)' : 'Configure Biometric / PIN Lock'}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Pro Feature: Financial Hub */}
          <button
            onClick={onOpenFinanceHub}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition"
            title="Open Consolidated Bills & Cards Hub"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Bills Hub</span>
          </button>

          {/* Pro Feature: PDF Export Report */}
          <button
            onClick={onOpenPdfReport}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition shadow-sm"
            title="Generate and Download PDF Summary Report"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF Report</span>
          </button>

          {/* Pro Feature: Admin Dashboard */}
          <button
            onClick={onOpenAdminDashboard}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 transition shadow-sm"
            title="Open Admin Dashboard & Account Data Settings"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin</span>
          </button>

          {/* Pro Feature: Emergency Dossier */}
          <button
            onClick={onOpenEmergencyHub}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition"
            title="Open Emergency Medical & ID Card"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Dossier</span>
          </button>

          {/* Ask Assistant */}
          <button
            onClick={onOpenGlobalChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask AI</span>
          </button>

          {/* Google Auth Button / Account status */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              user
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300 hover:bg-slate-850'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-transparent shadow'
            }`}
          >
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-4 h-4 rounded-full object-cover border border-emerald-400"
                  />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Synced'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign In</span>
              </>
            )}
          </button>

          {/* Add Item / Scan CTA */}
          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add / Scan</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
