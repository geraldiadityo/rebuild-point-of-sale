import { type LucideIcon } from "lucide-react";

// ─── Navigation Types ─────────────────────────────────────────────────────────

export interface NavItem {
    /** Display label */
    label: string;
    /** Route path */
    href: string;
    /** Lucide icon component */
    icon?: LucideIcon;
    /** Nested sub-items for collapsible menus */
    children?: NavItem[];
    /** Badge text (e.g. "New", "3") */
    badge?: string;
}

export interface NavGroup {
    /** Section title (e.g. "MENU", "SETTINGS") */
    title: string;
    items: NavItem[];
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface UserInfo {
    name: string;
    role: string;
    avatar?: string;
    email?: string;
}

// ─── Dashboard Wrapper Props ──────────────────────────────────────────────────

export interface DashboardWrapperProps {
    children: React.ReactNode;
    /** Navigation groups for the sidebar */
    navigation: NavGroup[];
    /** Current user information for the header */
    user: UserInfo;
    /** Application name / logo text */
    appName?: string;
}
