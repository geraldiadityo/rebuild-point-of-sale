"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/domains/shared/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { NavGroup, NavItem } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
    navigation: NavGroup[];
    appName?: string;
    onClose?: () => void;
}

// ─── NavLink Item ─────────────────────────────────────────────────────────────

function NavLinkItem({
    item,
    pathname,
    depth = 0,
}: {
    item: NavItem;
    pathname: string;
    depth?: number;
}) {
    const [isOpen, setIsOpen] = useState(() => {
        // Auto-expand if child matches current path
        if (item.children) {
            return item.children.some((child) => pathname.startsWith(child.href));
        }
        return false;
    });

    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    if (hasChildren) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isOpen && "text-foreground",
                        depth > 0 && "pl-10"
                    )}
                >
                    {Icon && <Icon className="size-5 shrink-0" />}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {item.badge}
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            "size-4 shrink-0 transition-transform duration-200",
                            isOpen && "rotate-180"
                        )}
                    />
                </button>

                <div
                    className={cn(
                        "overflow-hidden transition-all duration-200",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                >
                    <div className="mt-1 space-y-0.5 pl-4">
                        {item.children!.map((child) => (
                            <NavLinkItem
                                key={child.href}
                                item={child}
                                pathname={pathname}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                depth > 0 && "py-2 pl-10"
            )}
        >
            {Icon && <Icon className="size-5 shrink-0" />}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
                <span
                    className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                    )}
                >
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export function Sidebar({ navigation, appName = "TailAdmin" }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col bg-card border-r border-border">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">
                        {appName.charAt(0)}
                    </span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                    {appName}
                </span>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-4">
                <nav className="space-y-6">
                    {navigation.map((group) => (
                        <div key={group.title}>
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                {group.title}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLinkItem
                                        key={item.href}
                                        item={item}
                                        pathname={pathname}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
}
