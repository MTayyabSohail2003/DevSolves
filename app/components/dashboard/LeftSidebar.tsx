'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebarNavigation, sidebarFooterItems, type NavItem, type NavSection } from '@/config/navigation';
import { X, ChevronRight } from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ isOpen, onClose }: LeftSidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, compact = false }: { item: NavItem; compact?: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`
          group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${active
            ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }
        `}
        title={compact ? item.label : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[var(--color-primary-500)]' : ''}`} />
        <span className={`flex-1 whitespace-nowrap transition-all duration-300 ${compact ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          {item.label}
        </span>
        {!compact && item.badge && (
          <span className={`
            px-2 py-0.5 text-xs font-semibold rounded-full
            ${typeof item.badge === 'string'
              ? 'bg-[var(--color-primary-500)] text-white'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }
          `}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Navigation Sections */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {sidebarNavigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && !compact && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider transition-opacity duration-300">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} compact={compact} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Items */}
      <div className="border-t border-[var(--border-light)] py-4 px-3 space-y-1">
        {sidebarFooterItems.map((item) => (
          <NavLink key={item.href} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Hover to Expand */}
      <aside
        className={`
          hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 
          border-r border-[var(--border-light)] bg-[var(--bg-primary)]
          transition-all duration-300 ease-out overflow-hidden
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Expand indicator */}
        <div className={`
          absolute right-0 top-1/2 -translate-y-1/2 z-10
          w-5 h-10 flex items-center justify-center
          bg-[var(--bg-secondary)] border border-[var(--border-light)] border-r-0
          rounded-l-lg shadow-sm
          transition-all duration-300
          ${isExpanded ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}
        `}>
          <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
        </div>
        <SidebarContent compact={!isExpanded} />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed top-0 left-0 z-50 w-72 h-full bg-[var(--bg-primary)] shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-light)]">
          <span className="font-bold text-lg text-[var(--text-primary)]">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SidebarContent />
      </aside>
    </>
  );
}

