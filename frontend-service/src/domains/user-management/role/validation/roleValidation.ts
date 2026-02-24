import { z } from 'zod';

export const roleSchema = z.object({
    nama: z.string().min(3,'min 3 character').max(100, 'Max 100 character')
})

export const roleEditSchema = roleSchema.extend({
    id: z.number().min(1, 'Required ID')
})

export type RoleFormValue = z.infer<typeof roleSchema>;
export type RoleEditValue = z.infer<typeof roleEditSchema>;