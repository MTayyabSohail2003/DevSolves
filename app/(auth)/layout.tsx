import React from 'react';
import Logo from '@/app/components/ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Side - Branding & Decoration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-500)] via-[var(--color-primary-600)] to-[var(--color-accent-700)]">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[var(--color-primary-400)] rounded-full opacity-20 blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-[var(--color-accent-400)] rounded-full opacity-20 blur-3xl animate-float delay-200" />
          <div className="absolute -bottom-32 left-1/4 w-[350px] h-[350px] bg-[var(--color-primary-300)] rounded-full opacity-20 blur-3xl animate-float delay-300" />
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-12 text-white w-full">
          <Logo size="lg" className="[&_span]:text-white [&_span]:from-white [&_span]:to-white/80" />

          <div className="space-y-8 my-auto py-12">
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight">
              Where developers
              <span className="block text-[var(--color-accent-200)] mt-2">solve problems together</span>
            </h1>
            <p className="text-lg xl:text-xl text-white/80 max-w-lg leading-relaxed">
              Join thousands of developers sharing knowledge, solving challenges, and building the future of code with AI assistance.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 xl:gap-10 pt-4">
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold">50K+</div>
                <div className="text-white/60 text-sm mt-1">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold">100K+</div>
                <div className="text-white/60 text-sm mt-1">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold">250K+</div>
                <div className="text-white/60 text-sm mt-1">Answers</div>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md border border-white/20">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/90 mb-4 italic leading-relaxed">
              &quot;DevSolve has transformed how I learn and solve coding challenges. The AI assistant is incredibly helpful and the community is amazing!&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-primary-400)] flex items-center justify-center font-bold text-lg">
                S
              </div>
              <div>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-white/60">Senior Developer at Google</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]">
          <Logo size="md" className="[&_span]:text-white [&_span]:from-white [&_span]:to-white/80" />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-[var(--bg-primary)] overflow-y-auto">
          <div className="w-full max-w-md animate-fade-in">
            {children}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden py-4 px-6 bg-[var(--bg-secondary)] border-t border-[var(--border-light)]">
          <p className="text-center text-xs text-[var(--text-tertiary)]">
            © 2024 DevSolve. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
