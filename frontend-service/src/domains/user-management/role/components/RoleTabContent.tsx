"use client";
import { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Role } from "../types";
import { useDeleteRole, useGetRoles } from "../services/roleService";
import { Button } from "@/domains/shared/ui/button";
import { Pencil, Plus, Trash2Icon } from "lucide-react";
import { SimpleTable } from "@/domains/shared/datatable";
import { Modal } from "@/domains/shared/modal/Modal";
import { AddRoleForm } from "./AddForm";
import { ActDialog } from "@/domains/shared/modal/ActDialog";
import { EditRoleForm } from "./EditForm";
import { showToast } from "@/core/toast/showToast";
import { ConfirmDialog } from "@/domains/shared/modal/ConfirmDialog";
import TitleText from "@/domains/shared/text/TItleText";

const roleColumns: ColumnDef<Role>[] = [
    { accessorKey: 'nama', header: 'Nama Role' }
];

export function RolesTabContent() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: roles, isLoading } = useGetRoles();

    const { mutate: deleteRoleMutate, isPending } = useDeleteRole({
        mutationConfig: {
            onSuccess: (resp) => {
                showToast.success(resp.message);
                setIsDeleteDialogOpen(false);
            },
            onError: (err) => {
                showToast.error(err.message)
            }
        }
    });



    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                    <TitleText
                        title="Data Role"
                    />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Role
                </Button>
            </div>
            <SimpleTable
                columns={roleColumns}
                data={roles?.data || []}
                showRowNumber={true}
                renderActions={(role) => (
                    <div className="flex items-center space-x-2">
                        <ActDialog
                            title="Edit Role"
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                            trigger={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Edit ${role.id}`}
                                >
                                    <Pencil className="size-3.5" />
                                </Button>
                            }
                        >
                            <EditRoleForm
                                defaultValues={role}
                                onSuccess={() => setIsEditDialogOpen(false)}
                                onCancel={() => setIsEditDialogOpen(false)}
                            />
                        </ActDialog>
                        <ConfirmDialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                            title="Apakah anda yakin?"
                            description={
                                <>
                                    Data Role <strong>{role.nama}</strong> akan dihapus secara permanent.
                                    Tindakan ini tidak dapat kembalikan
                                </>
                            }
                            onConfirm={() => {
                                deleteRoleMutate(role.id)
                            }}
                            isPending={isPending}
                            confirmText="Ya, Hapus"
                            pendingText="Menghapus..."
                            cancelText="Batal"
                            trigger={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Hapus role ${role.nama}`}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2Icon className="size-3.5" />
                                </Button>
                            }
                        />
                    </div>
                )}
            />
            <Modal
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Tambah Role Baru"
            >
                <AddRoleForm
                    onSuccess={() => setIsAddDialogOpen(false)}
                    onCancel={() => setIsAddDialogOpen(false)}
                />
            </Modal>
        </div>
    )
}