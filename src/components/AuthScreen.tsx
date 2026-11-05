
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setMessage('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const email = userEmail.trim().toLowerCase();

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.session) {
          onLogin(email, password);
        } else {
          setMessage(
            'Account created! Check your email and verify your account before logging in.'
          );
          switchMode('login');
          setMessage(
            'Account created! Check your email and verify your account before logging in.'
          );
        }
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        onLogin(email, password);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });

        if (error) throw error;

        setMessage('Password reset link sent. Check your email.');
        setMode('login');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#16131c] p-6 rounded-3xl border border-gray-800 shadow-2xl text-center">
        <h1 className="text-2xl font-black tracking-wider text-orange-500 mb-1">
          STORYVOID
        </h1>

        <p className="text-xs text-gray-400 mb-6">
          SERIALIZED AUDIO STREAMING
        </p>

        <h2 className="text-lg font-bold mb-2">
          {mode === 'login'
            ? 'Welcome Back'
            : mode === 'signup'
              ? 'Create Account'
              : 'Reset Password'}
        </h2>

        <p className="text-xs text-gray-400 mb-6">
          {mode === 'login'
            ? 'Login to continue your stories.'
            : mode === 'signup'
              ? 'Join STORYVOID and start listening.'
              : 'Enter your email to receive a reset link.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none"
                required
                minLength={6}
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-xl">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-400 text-xs bg-green-500/10 p-3 rounded-xl">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg mt-2"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-5 space-y-3 text-xs">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-orange-400 hover:text-orange-300"
              >
                Forgot Password?
              </button>

              <p className="text-gray-400">
                New to STORYVOID?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-orange-400 font-bold"
                >
                  Create Account
                </button>
              </p>
            </>
          )}

          {mode !== 'login' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-orange-400 font-bold"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
        
