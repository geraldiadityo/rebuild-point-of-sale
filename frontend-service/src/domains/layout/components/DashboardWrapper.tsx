"use client";

import { useState, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/domains/shared/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { DashboardWrapperProps } from "../types";

// ─── DashboardWrapper Component ───────────────────────────────────────────────

export function DashboardWrapper({
    children,
    navigation,
    user,
    appName,
}: DashboardWrapperProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = useCallback(() => {
        setMobileOpen((prev) => !prev);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* ── Desktop Sidebar ────────────────────────────────────────── */}
            <aside className="hidden lg:flex lg:w-72 lg:shrink-0">
                <Sidebar navigation={navigation} appName={appName} />
            </aside>

            {/* ── Mobile Sidebar (Sheet) ─────────────────────────────────── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent
                    side="left"
                    className="w-72 p-0 [&>button]:hidden"
                    showCloseButton={false}
                >
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar
                        navigation={navigation}
                        appName={appName}
                        onClose={() => setMobileOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* ── Main Content Area ──────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} onMenuClick={toggleMobile} />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
