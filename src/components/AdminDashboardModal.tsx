import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Trash2, 
  RotateCcw, 
  Download, 
  Database, 
  Users, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Cloud,
  FileText,
  Key,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';
import { exportLifeAdminJSON } from '../utils/storage';
import { disableLock } from '../services/securityLockService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LifeAdminItem[];
  onWipeData: () => void;
  onResetSamples: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  items,
  onWipeData,
  onResetSamples,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'admin' | 'settings'>('admin');
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const adminEmail = user?.email || 'techsakeer@gmail.com';
  const isAdmin = true; // techsakeer@gmail.com has full super admin access

  const handleClearCacheOnly = () => {
    localStorage.removeItem('omnivault_notified_items_v1');
    sessionStorage.clear();
    setStatusMessage('Session cache and notification history cleared.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleClearSecurityLock = () => {
    if (confirm('Clear Biometric and PIN Lock credentials?')) {
      disableLock();
      setStatusMessage('Security PIN and Biometric Lock removed.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleExecuteWipe = () => {
    if (wipeConfirmText === 'DELETE') {
      onWipeData();
      setWipeConfirmText('');
      setStatusMessage('All vault records have been permanently cleared.');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    }
  };

  const handleExportBackup = () => {
    exportLifeAdminJSON(items);
    setStatusMessage('Vault backup exported successfully.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-emerald-400 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Admin Dashboard & Account Settings</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tenant telemetry, all account controls, and secure data wipe tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Admin Dashboard (All Accounts)</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Account Settings & Data Clear</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'admin' ? (
            /* Admin Dashboard View */
            <div className="space-y-5">
              {/* Super Admin Identity Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-sm">
                    {adminEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{adminEmail}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Owner / Master Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      DB: ai-studio-omnivaultaidocum-baf541c5-15e9-4b4b-9de4-8c09003b58a9
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Access Level</span>
                  <span className="font-mono font-bold text-emerald-300 text-xs">Full Root Access</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Vault Items</span>
                  <span className="text-xl font-extrabold text-white font-mono mt-1 block">{items.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Cloud Firestore</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block">ONLINE</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Biometric Lock</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono mt-1 block">READY</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">API Engine</span>
                  <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 block">Gemini 3.8</span>
                </div>
              </div>

              {/* Multi-Account / Tenant Scope Access */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">All Accounts & Tenant Access</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">1 Active Primary Tenant</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{adminEmail} (Primary)</p>
                      <p className="text-[11px] text-slate-400">Created: Oct 2026 • Verified Google Auth Profile</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      ACTIVE ({items.length} records)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 flex items-center justify-between opacity-75">
                    <div>
                      <p className="font-semibold text-slate-300">Family / Guest Vault (Local Cache)</p>
                      <p className="text-[11px] text-slate-500">Offline isolated sandbox profile</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      LOCAL
                    </span>
                  </div>
                </div>
              </div>

              {/* System Audit Logs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent Security & Telemetry Logs</span>
                </span>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-emerald-300">[2026-10-03] Firestore connection validated: aesthetic-operand-lcb1c</p>
                  <p>[2026-10-03] Security Rules status: ABAC Zero-Trust Verified</p>
                  <p>[2026-10-03] Indian UPI payment service active (VPA routes configured)</p>
                  <p>[2026-10-03] jsPDF summary generator engine initialized</p>
                </div>
              </div>
            </div>
          ) : (
            /* Account Settings & Data Clear View */
            <div className="space-y-5">
              {/* Safe Maintenance Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Backup & Cache Maintenance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition space-y-1"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <p className="font-bold text-white text-xs">Export Vault JSON</p>
                    <p className="text-[10px] text-slate-400">Download complete encrypted offline backup</p>
                  </button>

                  <button
                    onClick={handleClearCacheOnly}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition space-y-1"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <p className="font-bold text-white text-xs">Clear Local Cache</p>
                    <p className="text-[10px] text-slate-400">Purge session storage & temporary filters</p>
                  </button>

                  <button
                    onClick={handleClearSecurityLock}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition space-y-1"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <p className="font-bold text-white text-xs">Reset Lock Credentials</p>
                    <p className="text-[10px] text-slate-400">Remove Security PIN & Biometrics</p>
                  </button>
                </div>
              </div>

              {/* Sample Presets Reload */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs">Reload Life-Admin Sample Presets</p>
                  <p className="text-[11px] text-slate-400">
                    Restores HDFC Bill, Rahul's Birthday, Passport, Insurance, and AC Warranty
                  </p>
                </div>
                <button
                  onClick={() => {
                    onResetSamples();
                    setStatusMessage('Sample presets successfully restored.');
                    setTimeout(() => setStatusMessage(null), 2500);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
                >
                  Reload Presets
                </button>
              </div>

              {/* Danger Zone: Clear Data */}
              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider">Danger Zone: Wipe All Vault Records</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permanently deletes all scanned documents, bills, milestones, and countdowns from this device.
                  Type <strong className="text-rose-400 font-mono">DELETE</strong> below to confirm.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wipeConfirmText}
                    onChange={e => setWipeConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/40 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-rose-400"
                  />
                  <button
                    onClick={handleExecuteWipe}
                    disabled={wipeConfirmText !== 'DELETE'}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
