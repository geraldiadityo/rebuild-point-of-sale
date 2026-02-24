import { showToast } from "@/core/toast/showToast";
import { useCreateRole } from "../services/roleService";
import { RoleForm } from "./RoleForm";

export function AddRoleForm({
    onSuccess,
    onCancel
}: {
    onSuccess?: () => void,
    onCancel?: () => void,
}) {
    const { mutate: createRoleMutate, isPending } = useCreateRole({
        mutationConfig: {
            onSuccess: (data) => {
                showToast.success(data.message);
                onSuccess?.()
            }
        }
    });

    return (
        <RoleForm
            onSubmit={(value) => createRoleMutate(value)}
            onCancel={onCancel}
            isSubmitting={isPending}
            mode="create"
        />
    )
}