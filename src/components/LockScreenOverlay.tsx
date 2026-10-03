import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Delete, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { 
  verifyPin, 
  authenticateBiometric, 
  hasBiometricEnabled, 
  isBiometricAvailable 
} from '../services/securityLockService';

interface LockScreenOverlayProps {
  isOpen: boolean;
  onUnlocked: () => void;
  title?: string;
  description?: string;
}

export const LockScreenOverlay: React.FC<LockScreenOverlayProps> = ({
  isOpen,
  onUnlocked,
  title = 'OmniVault is Locked',
  description = 'Enter your PIN or use biometrics to access your Vault & Emergency records',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authenticatingBio, setAuthenticatingBio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      isBiometricAvailable().then(avail => {
        setBiometricAvailable(avail || hasBiometricEnabled());
        // Try auto biometric trigger if available
        if (avail && hasBiometricEnabled()) {
          handleBiometricUnlock();
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length >= 4) {
        // Test PIN on 4 or more digits
        verifyPin(nextPin).then(valid => {
          if (valid) {
            onUnlocked();
          } else if (nextPin.length >= 4 && nextPin.length === 6) {
            triggerError();
          }
        });
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const triggerError = () => {
    setError(true);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 600);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    const valid = await verifyPin(pin);
    if (valid) {
      onUnlocked();
    } else {
      triggerError();
    }
  };

  const handleBiometricUnlock = async () => {
    setAuthenticatingBio(true);
    try {
      const success = await authenticateBiometric();
      if (success) {
        onUnlocked();
      }
    } finally {
      setAuthenticatingBio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div className={`w-full max-w-sm flex flex-col items-center text-center space-y-6 ${shake ? 'animate-shake' : ''}`}>
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-[2px] shadow-2xl shadow-emerald-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 max-w-xs">{description}</p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center gap-3 my-2">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? error
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-emerald-400 border-emerald-400 scale-110'
                  : 'bg-transparent border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Biometric Button if available */}
        {biometricAvailable && (
          <button
            onClick={handleBiometricUnlock}
            disabled={authenticatingBio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>{authenticatingBio ? 'Verifying...' : 'Unlock with Biometrics'}</span>
          </button>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3.5 w-64 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitPress(num)}
              className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-emerald-500/20 border border-slate-800 text-xl font-bold text-white transition flex items-center justify-center shadow"
            >
              {num}
            </button>
          ))}

          {/* Biometric shortcut or empty */}
          <button
            type="button"
            onClick={handleBiometricUnlock}
            className="w-16 h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-transparent hover:border-slate-800 text-emerald-400 transition flex items-center justify-center"
            title="Biometric Authentication"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-emerald-500/20 border border-slate-800 text-xl font-bold text-white transition flex items-center justify-center shadow"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Enter key fallback */}
        {pin.length >= 4 && (
          <button
            onClick={handleManualSubmit}
            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Unlock Now
          </button>
        )}
      </div>
    </div>
  );
};
