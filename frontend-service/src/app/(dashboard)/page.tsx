import { AppBreadcrumb } from "@/domains/shared/breadcrumb/Breadcrumb";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <AppBreadcrumb />
                </div>
            </div>

            {/* Demo Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Revenue", value: "$45,231.89", change: "+20.1%" },
                    { title: "Subscriptions", value: "+2,350", change: "+180.1%" },
                    { title: "Sales", value: "+12,234", change: "+19%" },
                    { title: "Active Now", value: "+573", change: "+201" },
                ].map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                        <p className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {card.value}
                        </p>
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            {card.change} from last month
                        </p>
                    </div>
                ))}
            </div>

            {/* Placeholder content area */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground">
                    Recent Activity
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your dashboard components are ready. Start building your features
                    using the domain-driven structure.
                </p>
            </div>
        </div>
    );
}
