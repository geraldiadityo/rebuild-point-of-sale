"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/domains/shared/ui/button";
import { Input } from "@/domains/shared/ui/input";
import { Label } from "@/domains/shared/ui/label";
import { Checkbox } from "@/domains/shared/ui/checkbox";
import { PasswordInput } from "@/domains/shared/password-input/PasswordInput";
import { showToast } from "@/core/toast/showToast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            showToast.warning("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));
        setIsLoading(false);

        // Demo: show success toast
        showToast.success("Welcome back!", `Logged in as ${email}`);
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo / App Name */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                    T
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Sign in to your account to continue
                </p>
            </div>

            {/* Login Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="#"
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) =>
                                setRemember(checked === true)
                            }
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-normal cursor-pointer"
                        >
                            Remember me
                        </Label>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                    href="#"
                    className="font-medium text-foreground hover:underline"
                >
                    Create an account
                </Link>
            </p>
        </div>
    );
}
