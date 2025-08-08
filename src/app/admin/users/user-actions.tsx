
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { MoreHorizontal, UserCheck, UserCog, UserX, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, updateUserDisabledStatus, deleteUser } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserRole = 'admin' | 'moderator' | 'user';

interface UserActionsProps {
    userId: string;
    currentRole: UserRole;
    isDisabled: boolean;
}

export default function UserActions({ userId, currentRole, isDisabled }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser, isAdmin } = useAuth();

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole || !isAdmin) return;
    setIsLoading(true);
    try {
      const result = await updateUserRole(userId, newRole as UserRole);
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
    if (disabled === isDisabled || !isAdmin) return;
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

  const handleDelete = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setIsDeleteDialogOpen(false);
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
       toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
       setIsLoading(false);
    }
  }

  // Prevent admins from performing actions on themselves
  const isSelf = currentUser?.uid === userId;

  if (!isAdmin) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                     <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Only admins can manage users.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading || isSelf}>
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
              <DropdownMenuRadioItem value="moderator">Moderator</DropdownMenuRadioItem>
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
          
          <DropdownMenuSeparator />

          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 /> Delete User
            </DropdownMenuItem>
          </AlertDialogTrigger>

        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user's account and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? 'Deleting...' : 'Yes, delete user'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
