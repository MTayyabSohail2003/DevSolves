'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/app/components/ui';
import { forgotPasswordSchema, getZodErrors } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (): boolean => {
    const validationErrors = getZodErrors(forgotPasswordSchema, { email });
    if (validationErrors.email) {
      setError(validationErrors.email);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Reset email sent to:', email);
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
        {/* Success State */}
        <Card variant="glass" className="animate-scale-in text-center backdrop-blur-xl">
          {/* Animated Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-white animate-[bounce_1s_ease-in-out]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-success-500)] opacity-30 animate-ping" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
            Check your inbox
          </h1>
          
          <p className="text-[var(--text-secondary)] mb-2">
            We&apos;ve sent password reset instructions to
          </p>
          <p className="font-semibold text-[var(--text-primary)] mb-6 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg inline-block">
            {email}
          </p>

          {/* Email tips */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Didn&apos;t receive the email?</p>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Check your spam or junk folder
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Make sure the email address is correct
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3 px-4 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded-xl transition-all duration-200"
            >
              Try a different email
            </button>

            <Link href="/login" className="block">
              <Button variant="outline" fullWidth className="h-12">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-lg mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Reset your password
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-sm mx-auto">
          Enter your email address and we&apos;ll send you instructions to reset your password
        </p>
      </div>

      {/* Main Card */}
      <Card variant="glass" className="animate-slide-up backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Button type="submit" fullWidth isLoading={isLoading} className="h-12 text-base font-semibold shadow-lg shadow-[var(--color-primary-500)]/20">
            Send reset link
          </Button>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Security tip</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                For your protection, the link will expire in 24 hours
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}
