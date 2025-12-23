'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/app/components/ui';
import { loginSchema, getZodErrors, type LoginFormData } from '@/lib/validations/auth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = getZodErrors(loginSchema, formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Login submitted:', formData);
      // Handle successful login (redirect, etc.)
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header with Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-lg mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Sign in to continue your coding journey
        </p>
      </div>

      {/* Main Card */}
      <Card variant="glass" className="animate-slide-up backdrop-blur-xl">
        {/* Social Login */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-light)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-400)] hover:bg-[var(--bg-secondary)] transition-all duration-200 group">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">Google</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-light)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-400)] hover:bg-[var(--bg-secondary)] transition-all duration-200 group">
            <svg className="w-5 h-5 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-light)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs font-medium uppercase tracking-wider bg-[var(--bg-primary)] text-[var(--text-tertiary)]">
              or continue with email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="relative w-5 h-5 rounded-md border-2 border-[var(--border-medium)] bg-[var(--bg-secondary)] peer-checked:bg-[var(--color-primary-500)] peer-checked:border-[var(--color-primary-500)] transition-all duration-200 flex items-center justify-center">
                <svg 
                  className={`w-3 h-3 text-white transition-all duration-200 ${formData.rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Remember me</span>
            </label>
            
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading} className="h-12 text-base font-semibold shadow-lg shadow-[var(--color-primary-500)]/20 hover:shadow-xl hover:shadow-[var(--color-primary-500)]/30 transition-all duration-300">
            Sign in
          </Button>
        </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors underline-offset-4 hover:underline"
        >
          Create free account
        </Link>
      </p>
      </Card>
    </div>
  );
}
