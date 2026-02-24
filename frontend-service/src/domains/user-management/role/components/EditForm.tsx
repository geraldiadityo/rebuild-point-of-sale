import { showToast } from "@/core/toast/showToast";
import { RoleEditValue, RoleFormValue } from "../validation/roleValidation";
import { useUpdateRole } from "../services/roleService";
import { RoleForm } from "./RoleForm";

interface EditRoleFormProps {
    defaultValues: RoleEditValue;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EditRoleForm({
    defaultValues,
    onSuccess,
    onCancel,
}: EditRoleFormProps) {
    const { id, ...values } = defaultValues;

    const { mutate: updateRoleMutate, isPending } = useUpdateRole({
        mutationConfig: {
            onSuccess: (data) => {
                showToast.success(data.message);
                onSuccess?.();
            },
            onError: (err) => {
                showToast.error(err.message)
            }
        },
    });

    const handleSubmit = (values: RoleFormValue) => {
        updateRoleMutate({id, data: values});
    }

    return (
        <RoleForm
            defaultValues={values}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isSubmitting={isPending}
            mode="update"
        />
    )
}