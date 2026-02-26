"use client";
import { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    control: any;
    name: string;
    label?: string;
    placeholder?: string;
    description?: string;
    showToggle?: boolean;
}

export function NewPasswordInput({
    control,
    name,
    label,
    placeholder = 'Enter Password',
    description,
    showToggle=true
}: PasswordInputProps){
    const [isShowPassword, setIsShowPassword] = useState(false);
    
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div className="relative">
                            <Input
                                type={isShowPassword ? 'text' : 'password'}
                                placeholder={placeholder}
                                className="pr-10"
                                {...field}
                            />
                            {showToggle && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsShowPassword(!isShowPassword)}
                                >
                                    {isShowPassword
                                        ? (<EyeOff className="h-4 w-4" />)
                                        : (<Eye className="h-4 w-4" />)
                                    }
                                </button>
                            )}
                        </div>
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}