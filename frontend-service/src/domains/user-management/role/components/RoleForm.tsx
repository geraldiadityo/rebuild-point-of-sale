import { zodResolver } from "@hookform/resolvers/zod";
import { RoleFormValue, roleSchema } from "../validation/roleValidation";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/domains/shared/ui/form";
import { Input } from "@/domains/shared/ui/input";
import { Button } from "@/domains/shared/ui/button";

interface RoleFormProps {
    defaultValues?: RoleFormValue;
    onSubmit: (values: RoleFormValue) => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    mode?: 'create' | 'update'
}

export function RoleForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting=false,
    mode='create'
}: RoleFormProps) {
    const form = useForm<RoleFormValue>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            nama: '',
            ...defaultValues
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Role</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Masukan Nama Role"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    {onCancel && (
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (mode === 'create' ? 'adding...' : 'updating....') : (mode === 'create' ? 'Add' : 'Update')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}