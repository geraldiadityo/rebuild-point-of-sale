"use client";

import { DashboardWrapper } from "@/domains/layout/components/DashboardWrapper";
import type { NavGroup, UserInfo } from "@/domains/layout/types";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Package,
    BarChart3,
    Settings,
    HelpCircle,
    FileText,
} from "lucide-react";

// ─── Sample Navigation (Replace with your actual navigation) ──────────────────

const navigation: NavGroup[] = [
    {
        title: "Menu",
        items: [
            {
                label: "Dashboard",
                href: "/",
                icon: LayoutDashboard,
            },
            {
                label: "Products",
                href: "/products",
                icon: Package,
                badge: "New",
                children: [
                    { label: "All Products", href: "/products" },
                    { label: "Add Product", href: "/products/create" },
                    { label: "Categories", href: "/products/categories" },
                ],
            },
            {
                label: "Orders",
                href: "/orders",
                icon: ShoppingCart,
                badge: "5",
            },
            {
                label: "Customers",
                href: "/customers",
                icon: Users,
            },
            {
                label: "Analytics",
                href: "/analytics",
                icon: BarChart3,
            },
            {
                label: "Invoices",
                href: "/invoices",
                icon: FileText,
            },
        ],
    },
    {
        title: "Settings",
        items: [
            {
                label: "Settings",
                href: "/settings",
                icon: Settings,
            },
            {
                label: "Help & Support",
                href: "/support",
                icon: HelpCircle,
            },
        ],
    },
];

const user: UserInfo = {
    name: "John Doe",
    role: "Administrator",
    email: "john@example.com",
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardWrapper navigation={navigation} user={user} appName="TailAdmin">
            {children}
        </DashboardWrapper>
    );
}
