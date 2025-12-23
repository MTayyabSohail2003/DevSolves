'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/app/components/ui';
import { 
  registerStep1Schema, 
  registerStep2Schema, 
  getZodErrors 
} from '@/lib/validations/auth';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
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

  const validateStep1 = (): boolean => {
    const validationErrors = getZodErrors(registerStep1Schema, {
      name: formData.name,
      email: formData.email,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const validationErrors = getZodErrors(registerStep2Schema, {
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Register submitted:', formData);
      // Handle successful registration
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'var(--color-error-500)' };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'var(--color-warning-500)' };
    return { strength: 100, label: 'Strong', color: 'var(--color-success-500)' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)] shadow-lg mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Create your account
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Join thousands of developers worldwide
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
          1
        </div>
        <div className={`w-16 h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--bg-tertiary)]'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
          2
        </div>
      </div>

      {/* Main Card */}
      <Card variant="glass" className="animate-slide-up backdrop-blur-xl">
        {step === 1 ? (
          <>
            {/* Social Signup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-light)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-400)] hover:bg-[var(--bg-secondary)] transition-all duration-200 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-[var(--text-primary)]">Google</span>
              </button>
              
              <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-light)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-400)] hover:bg-[var(--bg-secondary)] transition-all duration-200 group">
                <svg className="w-5 h-5 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium text-[var(--text-primary)]">GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-light)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs font-medium uppercase tracking-wider bg-[var(--bg-primary)] text-[var(--text-tertiary)]">
                  or use email
                </span>
              </div>
            </div>

            {/* Step 1 Form */}
            <div className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

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

              <Button onClick={handleNext} fullWidth className="h-12 text-base font-semibold">
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to previous step
            </button>

            {/* Step 2 Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label} password
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className={`relative w-5 h-5 mt-0.5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${formData.acceptTerms ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)]' : 'border-[var(--border-medium)] bg-[var(--bg-secondary)]'}`}>
                    <svg 
                      className={`w-3 h-3 text-white transition-all duration-200 ${formData.acceptTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[var(--color-primary-600)] hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[var(--color-primary-600)] hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.acceptTerms}</p>
                )}
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} className="h-12 text-base font-semibold shadow-lg shadow-[var(--color-primary-500)]/20">
                Create account
              </Button>
            </form>
          </>
        )}

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
      </Card>
    </div>
  );
}
