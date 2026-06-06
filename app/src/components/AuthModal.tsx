import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'sh_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen } = useStore();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleClose = () => {
    setIsAuthOpen(false);
    setStep('form');
    setOtpDigits(['', '', '', '']);
    setGeneratedOtp('');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value !== '' && isNaN(Number(value))) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next field
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const resendOtp = () => {
    setError('');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    alert('🔑 shiningstore.com: Your registration verification code is ' + code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (tab === 'signup') {
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'live.com', 'msn.com', 'yandex.com', 'gmx.com'];
      const domain = email.split('@')[1]?.toLowerCase().trim();
      if (!allowedDomains.includes(domain)) {
        setError('Please use a trusted email service (e.g., Gmail, Yahoo, Outlook, iCloud).');
        return;
      }

      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      // Check if email already exists
      try {
        const usersRaw = localStorage.getItem('shiningstore_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) {
          setError('An account with this email already exists.');
          return;
        }
      } catch (err) {}

      // Enter OTP phase
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setLoading(false);
      setStep('otp');
      alert('🔑 shiningstore.com: Your registration verification code is ' + code);
      return;
    }

    // Login logic
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const usersRaw = localStorage.getItem('shiningstore_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        setError('No account found with this email.');
        setLoading(false);
        return;
      }

      if (user.password !== hashPassword(password)) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // Save session
      localStorage.setItem(
        'shiningstore_session',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          joinDate: user.joinDate,
          loggedInAt: new Date().toISOString(),
        })
      );
      
      localStorage.setItem('shiningstore_user', JSON.stringify(user));

      handleClose();
      window.location.reload();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the complete 4-digit code.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError('Invalid verification code. Please check your email and try again.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const usersRaw = localStorage.getItem('shiningstore_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const newUser = {
        id: 'user_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        joinDate: new Date().toISOString(),
        orders: [],
        wishlist: [],
        rewardPoints: 50,
      };

      users.push(newUser);
      localStorage.setItem('shiningstore_users', JSON.stringify(users));
      
      localStorage.setItem(
        'shiningstore_session',
        JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          joinDate: newUser.joinDate,
          loggedInAt: new Date().toISOString(),
        })
      );
      
      localStorage.setItem('shiningstore_user', JSON.stringify(newUser));

      handleClose();
      window.location.reload();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] rounded-2xl p-6 md:p-8 animate-scale-in"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} style={{ color: 'var(--color-muted)' }} />
        </button>

        {step === 'otp' ? (
          <>
            {/* OTP Verification Layout */}
            <div className="text-center mb-6">
              <h3
                className="text-2xl font-semibold mb-1"
                style={{ color: 'var(--color-charcoal)' }}
              >
                Verify Email
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Enter the 4-digit verification code sent to <strong className="text-neutral-700">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-xs font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {/* OTP Digits Grid */}
              <div className="flex justify-center gap-3 my-4">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-neutral-800"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-xs font-semibold uppercase transition-all duration-300 tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-charcoal)',
                  color: 'var(--color-cream)',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>

              <div className="text-center text-xs text-neutral-500">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={resendOtp}
                  className="font-medium text-amber-500 hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h3
                className="text-2xl font-semibold mb-1"
                style={{ color: 'var(--color-charcoal)' }}
              >
                {tab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {tab === 'login'
                  ? 'Sign in to access your account'
                  : 'Join Shining Store for exclusive benefits'}
              </p>
            </div>

            {/* Tabs */}
            <div
              className="flex border-b mb-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'login'
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setTab('signup');
                  setError('');
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'signup'
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-xs font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {tab === 'signup' && (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-neutral-800"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-neutral-800"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-neutral-800"
                  required
                />
              </div>

              {tab === 'signup' && (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-neutral-800"
                    required
                  />
                </div>
              )}

              {tab === 'login' && (
                <div className="flex justify-between items-center text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-500">
                    <input type="checkbox" className="rounded text-amber-500 focus:ring-0" />
                    Remember me
                  </label>
                  <a href="#" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
                    Forgot Password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-xs font-semibold uppercase transition-all duration-300 tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-charcoal)',
                  color: 'var(--color-cream)',
                }}
              >
                {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center text-center my-5 text-neutral-400 text-xs font-semibold">
              <span className="flex-1 border-b border-neutral-100" />
              <span className="px-3 uppercase tracking-wider text-[10px]">OR</span>
              <span className="flex-1 border-b border-neutral-100" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => alert('Google sign-in coming soon!')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 active:scale-[0.98] transition-all bg-white"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => alert('Apple sign-in coming soon!')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 active:scale-[0.98] transition-all bg-white"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-black">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.12 0 1.07.03 2.81-1.33z"/>
                </svg>
                Apple
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
