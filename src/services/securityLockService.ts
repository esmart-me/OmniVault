/**
 * Biometric & PIN Security Lock Service for OmniVault Pro
 * Uses Web Authentication API (WebAuthn) for Biometrics and Web Crypto SHA-256 for PIN
 */

const LOCK_ENABLED_KEY = 'omnivault_lock_enabled';
const PIN_HASH_KEY = 'omnivault_pin_hash';
const BIOMETRIC_ENABLED_KEY = 'omnivault_biometric_enabled';
const AUTOLOCK_MINUTES_KEY = 'omnivault_autolock_mins';
const SESSION_UNLOCKED_KEY = 'omnivault_session_unlocked';
const LAST_ACTIVE_KEY = 'omnivault_last_active_timestamp';

// Hash PIN securely using Web Crypto API SHA-256
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_omnivault_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if biometric authentication is available on device
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (e) {
    console.warn('Biometric check failed:', e);
  }
  return false;
}

// Register WebAuthn biometric credential
export async function registerBiometric(username = 'OmniVault User'): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) return false;

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'OmniVault Vault Security' },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // TouchID, FaceID, Windows Hello, Android Biometrics
          userVerification: 'required',
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential;

    if (credential) {
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      localStorage.setItem('omnivault_cred_id', credential.id);
      return true;
    }
  } catch (err: any) {
    console.warn('Biometric registration error or cancelled:', err);
  }
  return false;
}

// Authenticate via Biometric (WebAuthn)
export async function authenticateBiometric(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) return false;

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'required',
        timeout: 60000,
      },
    });

    if (assertion) {
      setSessionUnlocked(true);
      return true;
    }
  } catch (err) {
    console.warn('Biometric authentication cancelled or failed:', err);
  }
  return false;
}

// Check lock configuration
export function isLockConfigured(): boolean {
  return localStorage.getItem(LOCK_ENABLED_KEY) === 'true' && Boolean(localStorage.getItem(PIN_HASH_KEY));
}

// Check if currently locked
export function isCurrentlyLocked(): boolean {
  if (!isLockConfigured()) return false;

  const isUnlockedThisSession = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
  if (!isUnlockedThisSession) return true;

  // Check timeout if auto-lock is configured
  const autoLockMins = parseInt(localStorage.getItem(AUTOLOCK_MINUTES_KEY) || '5', 10);
  if (autoLockMins > 0) {
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
    const now = Date.now();
    if (now - lastActive > autoLockMins * 60 * 1000) {
      setSessionUnlocked(false);
      return true;
    }
  }

  return false;
}

export function touchLastActive(): void {
  localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

export function setSessionUnlocked(unlocked: boolean): void {
  if (unlocked) {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
    touchLastActive();
  } else {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  }
}

export async function setupLock(pin: string, enableBiometrics = false): Promise<boolean> {
  if (pin.length < 4) return false;
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  localStorage.setItem(LOCK_ENABLED_KEY, 'true');
  if (enableBiometrics) {
    await registerBiometric();
  }
  setSessionUnlocked(true);
  return true;
}

export async function verifyPin(inputPin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPin(inputPin);
  const isValid = inputHash === storedHash;
  if (isValid) {
    setSessionUnlocked(true);
  }
  return isValid;
}

export function disableLock(): void {
  localStorage.removeItem(LOCK_ENABLED_KEY);
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
}

export function hasBiometricEnabled(): boolean {
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
}
