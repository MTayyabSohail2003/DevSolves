'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordSchema, getZodErrors } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (): boolean => {
    const validationErrors = getZodErrors(forgotPasswordSchema, { email });
    if (validationErrors.email) { setError(validationErrors.email); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Check your inbox</h1>
          <p className="text-[var(--text-secondary)] mb-2">We&apos;ve sent password reset instructions to</p>
          <p className="font-semibold text-[var(--text-primary)] mb-6 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg inline-block">{email}</p>
          <div className="space-y-3">
            <button onClick={() => setIsSubmitted(false)} className="w-full py-3 text-sm text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] rounded-xl transition-all">Try a different email</button>
            <Link href="/login" className="block w-full py-3 border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] hover:border-[var(--color-primary-400)] transition-all">Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-lg mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Reset your password</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">Enter your email and we&apos;ll send you instructions</p>
      </div>

      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${error ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`}
            />
            {error && <p className="mt-2 text-sm text-[var(--color-error-500)]">{error}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 text-white font-semibold rounded-lg transition-all">{isLoading ? 'Sending...' : 'Send reset link'}</button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Back to login</Link>
      </div>
    </div>
  );
}
