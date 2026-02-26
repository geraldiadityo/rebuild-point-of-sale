"use client"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { User } from "../types"
import { useChangeStatusUser, useGetUsers } from "../services/userService"
import TitleText from "@/domains/shared/text/TItleText"
import { Button } from "@/domains/shared/ui/button"
import { PlusCircle } from "lucide-react"
import { SimpleTable } from "@/domains/shared/datatable"
import { Modal } from "@/domains/shared/modal/Modal"
import { UserCreatForm } from "./AddUserForm"
import { Switch } from "@/domains/shared/ui/switch"

const StatusCell = ({row}: {row: any}) => {
    const user = row.original as User;
    const { mutate: updateStatusMutate, isPending } = useChangeStatusUser();
    
    const handleToggle = () => {
        updateStatusMutate(user.id);
    };

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={user.status}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            <span className={`text-sm font-medium ${user.status ? 'text-green-600' : 'text-muted-foreground'}`}>
                {user.status ? "Aktif" : "Non Aktif"}
            </span>
        </div>
    )
}

const userColumns: ColumnDef<User>[] = [
    { accessorKey: 'nama', header: 'Nama Lengkap' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'role.nama', header: 'Role' },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => <StatusCell row={row} />
    }
]


export function UserTabContent() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { data: users, isLoading } = useGetUsers();
    
    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                    <TitleText
                        title="Data Users"
                    />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 size-4" />
                    Add Users
                </Button>
            </div>
            <div className="mt-5">
                <SimpleTable
                    columns={userColumns}
                    data={users?.data || []}
                    showRowNumber={true}
                />
            </div>
            <Modal
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Tambah User"
            >
                <UserCreatForm
                    onSuccess={() => setIsAddDialogOpen(false)}
                    onCancel={() => setIsAddDialogOpen(false)}
                />
            </Modal>
        </div>
    )
}