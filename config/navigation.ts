import {
    Home,
    MessageSquare,
    PlusCircle,
    Tags,
    Users,
    Bookmark,
    Trophy,
    Settings,
    HelpCircle,
    Sparkles,
    TrendingUp,
    Clock,
    Star
} from 'lucide-react';

// ============================================
// LEFT SIDEBAR NAVIGATION
// ============================================
export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

export const sidebarNavigation: NavSection[] = [
    {
        items: [
            { label: 'Home', href: '/dashboard', icon: Home },
            { label: 'Questions', href: '/dashboard/questions', icon: MessageSquare, badge: 'New' },
            { label: 'Ask Question', href: '/dashboard/ask', icon: PlusCircle },
        ],
    },
    {
        title: 'Browse',
        items: [
            { label: 'Tags', href: '/dashboard/tags', icon: Tags },
            { label: 'Users', href: '/dashboard/users', icon: Users },
            { label: 'Companies', href: '/dashboard/companies', icon: Trophy },
        ],
    },
    {
        title: 'Personal',
        items: [
            { label: 'Saved', href: '/dashboard/saved', icon: Bookmark },
            { label: 'AI Assistant', href: '/dashboard/chat', icon: Sparkles },
        ],
    },
];

export const sidebarFooterItems: NavItem[] = [
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

// ============================================
// RIGHT SIDEBAR DATA
// ============================================
export interface PopularQuestion {
    id: string;
    title: string;
    votes: number;
    answers: number;
    isHot?: boolean;
}

export interface TrendingTag {
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
}

export const popularQuestions: PopularQuestion[] = [
    {
        id: '1',
        title: 'How to fix React hydration errors in Next.js 14?',
        votes: 156,
        answers: 23,
        isHot: true,
    },
    {
        id: '2',
        title: 'Best practices for TypeScript error handling',
        votes: 89,
        answers: 15,
    },
    {
        id: '3',
        title: 'Optimizing Tailwind CSS bundle size',
        votes: 67,
        answers: 12,
    },
    {
        id: '4',
        title: 'Understanding React Server Components',
        votes: 54,
        answers: 8,
    },
];

export const trendingTags: TrendingTag[] = [
    { name: 'react', count: 1234, trend: 'up' },
    { name: 'typescript', count: 987, trend: 'up' },
    { name: 'nextjs', count: 756, trend: 'up' },
    { name: 'tailwindcss', count: 543, trend: 'stable' },
    { name: 'javascript', count: 432, trend: 'down' },
    { name: 'nodejs', count: 321, trend: 'stable' },
];

// ============================================
// ICONS FOR RIGHT SIDEBAR
// ============================================
export const RightSidebarIcons = {
    TrendingUp,
    Clock,
    Star,
};
