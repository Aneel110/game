
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserCog, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, updateUserDisabledStatus } from '@/lib/actions';

interface UserActionsProps {
    userId: string;
    currentRole: 'admin' | 'user';
    isDisabled: boolean;
}

export default function UserActions({ userId, currentRole, isDisabled }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    if (newRole === currentRole) return;
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
  };

  const handleStatusChange = async (disabled: boolean) => {
    if (disabled === isDisabled) return;
    setIsLoading(true);
    try {
        const result = await updateUserDisabledStatus(userId, disabled);
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
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup value={currentRole} onValueChange={handleRoleChange}>
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground"><UserCog /> Change Role</DropdownMenuLabel>
            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleStatusChange(!isDisabled)} disabled={isLoading}>
            {isDisabled ? (
                <div className='flex items-center gap-2 text-green-500'><UserCheck /> Enable Account</div>
            ) : (
                <div className='flex items-center gap-2 text-red-500'><UserX /> Disable Account</div>
            )}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
