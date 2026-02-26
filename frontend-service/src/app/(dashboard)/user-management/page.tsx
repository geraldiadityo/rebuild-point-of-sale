"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/domains/shared/ui/tabs";
import { RolesTabContent } from "@/domains/user-management/role/components/RoleTabContent";
import { UserTabContent } from "@/domains/user-management/user/components/UserTabContent";
import { UserCog, KeyRoundIcon } from "lucide-react";
export default function UserManagementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    User Management
                </h1>
            </div>
            {/* tabs */}
            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full max-w-400px grid-cols-2">
                    <TabsTrigger value="users">
                        <UserCog />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                        <KeyRoundIcon />
                        Roles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                    <UserTabContent />
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                    <RolesTabContent />
                </TabsContent>
            </Tabs>
        </div>
    )
}