import { useForm } from "react-hook-form";
import { UserCreateFormValue, userSchema } from "../validation/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetRoles } from "../../role/services/roleService";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/domains/shared/ui/form";
import { useCreateUser } from "../services/userService";
import { showToast } from "@/core/toast/showToast";
import { Input } from "@/domains/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/domains/shared/ui/select";
import { NewPasswordInput } from "@/domains/shared/password-input/PasswordNewInput";
import { Button } from "@/domains/shared/ui/button";

interface UserCreateFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function UserCreatForm({
    onCancel,
    onSuccess,
}: UserCreateFormProps) {
    const form = useForm<UserCreateFormValue>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            nama: '',
            roleId: '',
            password: '',
            confirm_password: ''
        }
    });

    const { data: roles, isLoading } = useGetRoles();

    const { mutate: createUserMutate, isPending} = useCreateUser({
        mutationConfig: {
            onSuccess: (data) => {
                showToast.success(data.message),
                onSuccess?.()
            },
            onError: (err) => {
                showToast.error(err.message)
            }
        }
    })

    

    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((value) => createUserMutate(value))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Masukan Username"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Masukan Nama Lengkap"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Role"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {roles?.data.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <NewPasswordInput
                    control={form.control}
                    name="password"
                    label="password"
                    placeholder="enter your password"
                    description="al least min 8 character"
                />
                <NewPasswordInput
                    control={form.control}
                    name="confirm_password"
                    label="confirm password"
                    placeholder="enter confirm password"
                    description="must be same with password"
                />
                <div className="flex justify-end space-x-2">
                    {onCancel && (
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? 'creating...' : 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

