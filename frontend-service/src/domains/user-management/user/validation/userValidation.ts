import { z } from 'zod';

export const userSchema = z.object({
    username: z.string().min(3, 'Minimal username 3 character').max(100, 'max length 100 character'),
    nama: z.string().min(3, 'minimal 3 character').max(100, 'max 100 character'),
    roleId: z.string().min(1, 'Required Role'),
    password: z.string().min(6, 'Minimal 6 character').regex(/[0-9]/, "Password must included number").regex(/[^A-Za-z0-0]/,"password must included symbol"),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: 'password and confirm password are not matched',
    path: ["confirm_password"]
});

export type UserCreateFormValue = z.infer<typeof userSchema>;
