"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/domains/shared/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Extra class names applied to the outer wrapper */
    wrapperClassName?: string;
}

/**
 * A password input with a built-in eye toggle to show/hide the password.
 * Extends all standard input props (except `type` which is managed internally).
 *
 * @example
 * <PasswordInput placeholder="Enter your password" {...register("password")} />
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, wrapperClassName, ...props }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <div className={cn("relative", wrapperClassName)}>
                <Input
                    ref={ref}
                    type={visible ? "text" : "password"}
                    className={cn("pr-10", className)}
                    {...props}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
