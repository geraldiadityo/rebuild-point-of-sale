"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { Button } from "@/domains/shared/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/domains/shared/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/domains/shared/ui/dropdown-menu";
import { Input } from "@/domains/shared/ui/input";
import { ThemeToggle } from "@/core/theme/ThemeToggle";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { useLogout } from "@/domains/auth/hooks/useLogout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
    onMenuClick: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// ─── Header Component ────────────────────────────────────────────────────────

export function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const logout = useLogout();

    // Hydration guard: render user data only after client mount
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const displayName = hasMounted && user ? user.nama : "";
    const displayRole = hasMounted && user ? user.role.nama : "";

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
            {/* Mobile Menu Toggle */}
            <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={onMenuClick}
                aria-label="Toggle sidebar"
            >
                <Menu className="size-5" />
            </Button>

            {/* Search */}
            <div className="relative hidden flex-1 sm:block sm:max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
            </div>

            {/* Right Side: Notifications & Profile */}
            <div className="ml-auto flex items-center gap-2">
                {/* Mobile search trigger */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="sm:hidden"
                    aria-label="Search"
                >
                    <Search className="size-5" />
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="size-5" />
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        3
                    </span>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent cursor-pointer"
                        >
                            <Avatar className="size-8">
                                <AvatarImage src={undefined} alt={displayName} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                                    {displayName ? getInitials(displayName) : "??"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden text-left md:block">
                                <p className="text-sm font-medium leading-none text-foreground">
                                    {displayName || "Loading..."}
                                </p>
                                <p className="text-xs text-muted-foreground">{displayRole}</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="font-medium">{displayName}</span>
                                {hasMounted && user?.username && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {user.username}
                                    </span>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={logout}>
                            <LogOut className="mr-2 size-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
