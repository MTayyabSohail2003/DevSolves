'use client';

import React, { useState } from 'react';
import { Navbar, LeftSidebar, RightSidebar } from '@/app/components/dashboard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Navbar */}
      <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <LeftSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 lg:px-6 py-6">
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
