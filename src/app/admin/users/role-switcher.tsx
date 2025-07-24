'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from "@/lib/actions";
import { useState } from "react";

export default function RoleSwitcher({ userId, currentRole }: { userId: string, currentRole: string }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleChange = async (newRole: 'admin' | 'user') => {
        setIsLoading(true);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
            } else {
                toast({ title: 'Error', description: result.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Select defaultValue={currentRole} onValueChange={handleRoleChange} disabled={isLoading}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
            </SelectContent>
        </Select>
    )
}
