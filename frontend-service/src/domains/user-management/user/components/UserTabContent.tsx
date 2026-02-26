"use client"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { User } from "../types"
import { useGetUsers } from "../services/userService"
import TitleText from "@/domains/shared/text/TItleText"
import { Button } from "@/domains/shared/ui/button"
import { PlusCircle } from "lucide-react"
import { SimpleTable } from "@/domains/shared/datatable"
import { Modal } from "@/domains/shared/modal/Modal"
import { UserCreatForm } from "./AddUserForm"

const userColumns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nama', header: 'Nama Lengkap' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'role.nama', header: 'Role' },
    { accessorKey: 'status', header: 'status' }
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