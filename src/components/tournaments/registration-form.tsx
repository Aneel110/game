
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { registerForTournament } from '@/lib/actions';
import { registrationSchema, type RegistrationFormValues } from '@/lib/schemas';
import Link from 'next/link';

interface TournamentRegistrationFormProps {
  tournamentId: string;
  isLoggedIn: boolean;
  isAlreadyRegistered: boolean;
}

export default function TournamentRegistrationForm({ tournamentId, isLoggedIn, isAlreadyRegistered }: TournamentRegistrationFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '',
      teamTag: '',
      players: [
        { pubgName: '', pubgId: '' }, 
        { pubgName: '', pubgId: '' }, 
        { pubgName: '', pubgId: '' }, 
        { pubgName: '', pubgId: '' }
      ],
      registeredById: user?.uid || '',
      registeredByName: user?.displayName || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'players',
  });
  
  // Set user info when auth state changes
  useState(() => {
    if (user) {
      form.setValue('registeredById', user.uid);
      form.setValue('registeredByName', user.displayName || user.email || 'Unknown User');
    }
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    try {
      const result = await registerForTournament(tournamentId, data);

      if (result.success) {
        toast({
          title: 'Registration Submitted!',
          description: result.message,
        });
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Registration Failed',
          description: result.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }
  
  const renderContent = () => {
    if (!isLoggedIn) {
        return (
            <div className="text-center">
                <DialogTitle>Login Required</DialogTitle>
                <DialogDescription className="my-4">You need to be logged in to register for a tournament.</DialogDescription>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )
    }

    if (isAlreadyRegistered) {
        return (
             <div className="text-center">
                <DialogTitle>Already Registered</DialogTitle>
                <DialogDescription className="my-4">You have already submitted a registration for this tournament.</DialogDescription>
            </div>
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Tournament Registration</DialogTitle>
                <DialogDescription>
                    Fill out your team details below. You need a minimum of 4 players and a maximum of 6.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="teamName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Vicious Vipers" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="teamTag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Tag</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., VPR" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormLabel>Players</FormLabel>
                        <div className="space-y-4 mt-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                                    <FormField
                                        control={form.control}
                                        name={`players.${index}.pubgName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder={`Player ${index + 1} Name`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`players.${index}.pubgId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder={`Player ${index + 1} ID`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`players.${index}.discordUsername`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Discord (Optional)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    disabled={fields.length <= 4}
                                    className="mt-1"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        </div>
                        <FormMessage>{form.formState.errors.players?.message}</FormMessage>
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ pubgName: '', pubgId: '', discordUsername: '' })}
                            disabled={fields.length >= 6}
                            >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Player
                        </Button>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={form.formState.isSubmitting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Registration
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </>
    )
  }

  const getTriggerButton = () => {
    if (isAlreadyRegistered) {
        return <Button size="lg" disabled>Already Registered</Button>
    }
    // The dialog itself handles the login prompt
    return <Button size="lg">Register Your Team</Button>
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {getTriggerButton()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
