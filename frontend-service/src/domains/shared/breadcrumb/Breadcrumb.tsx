"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import {
    Breadcrumb as BreadcrumbRoot,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/domains/shared/ui/breadcrumb";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItemData {
    label: string;
    href?: string;
}

interface AppBreadcrumbProps {
    /** Override auto-generated breadcrumb items (useful for dynamic routes) */
    items?: BreadcrumbItemData[];
    /** Custom label map for path segments, e.g. { "user-management": "User Management" } */
    labelMap?: Record<string, string>;
    /** Whether to show the Home crumb as the first item (default: true) */
    showHome?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSegment(
    segment: string,
    labelMap?: Record<string, string>
): string {
    if (labelMap?.[segment]) return labelMap[segment];

    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function generateBreadcrumbsFromPath(
    pathname: string,
    labelMap?: Record<string, string>,
    showHome?: boolean
): BreadcrumbItemData[] {
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItemData[] = [];

    if (showHome !== false) {
        items.push({ label: "Home", href: "/" });
    }

    segments.forEach((segment, index) => {
        // Skip route groups like (dashboard)
        if (segment.startsWith("(") && segment.endsWith(")")) return;

        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        items.push({
            label: formatSegment(segment, labelMap),
            href: isLast ? undefined : href,
        });
    });

    return items;
}

// ─── AppBreadcrumb Component ──────────────────────────────────────────────────

export function AppBreadcrumb({
    items,
    labelMap,
    showHome = true,
}: AppBreadcrumbProps) {
    const pathname = usePathname();

    const breadcrumbItems =
        items ?? generateBreadcrumbsFromPath(pathname, labelMap, showHome);

    if (breadcrumbItems.length === 0) return null;

    return (
        <BreadcrumbRoot>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;

                    return (
                        <Fragment key={item.label + index}>
                            <BreadcrumbItem>
                                {isLast || !item.href ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </BreadcrumbRoot>
    );
}
