
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
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
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { registerForTournament } from '@/lib/actions';
import Link from 'next/link';

interface Player {
    pubgName: string;
    pubgId: string;
    discordUsername?: string;
}

interface RegistrationFormValues {
  teamName: string;
  teamTag: string;
  players: Player[];
}

interface TournamentRegistrationFormProps {
  tournamentId: string;
  isLoggedIn: boolean;
  isAlreadyRegistered: boolean;
}

export default function TournamentRegistrationForm({ tournamentId, isLoggedIn, isAlreadyRegistered }: TournamentRegistrationFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RegistrationFormValues>({
    defaultValues: {
      teamName: '',
      teamTag: '',
      players: [
        { pubgName: '', pubgId: '', discordUsername: '' }, 
        { pubgName: '', pubgId: '', discordUsername: '' }, 
        { pubgName: '', pubgId: '', discordUsername: '' }, 
        { pubgName: '', pubgId: '', discordUsername: '' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'players',
  });

  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to register.',
        variant: 'destructive',
      });
      return;
    }

    if (data.players.length < 4 || data.players.length > 6) {
        form.setError("players", { message: "You need between 4 and 6 players." });
        return;
    }

    setIsLoading(true);
    try {
      const result = await registerForTournament(tournamentId, {
        ...data,
        registeredById: user.uid,
        registeredByName: user.displayName || user.email || 'Unknown User'
      });

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
    } finally {
      setIsLoading(false);
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
                     <div>
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input id="teamName" placeholder="e.g., Vicious Vipers" {...form.register("teamName", { required: "Team name is required." })} />
                        {form.formState.errors.teamName && <p className="text-sm text-destructive mt-1">{form.formState.errors.teamName.message}</p>}
                     </div>
                     <div>
                        <Label htmlFor="teamTag">Team Tag</Label>
                        <Input id="teamTag" placeholder="e.g., VPR" {...form.register("teamTag", { required: "Team tag is required." })} />
                        {form.formState.errors.teamTag && <p className="text-sm text-destructive mt-1">{form.formState.errors.teamTag.message}</p>}
                     </div>
                </div>

                <div>
                    <FormLabel>Players</FormLabel>
                    <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                             <div>
                                <Input placeholder={`Player ${index + 1} Name`} {...form.register(`players.${index}.pubgName`, { required: "Name is required."})} />
                                {form.formState.errors.players?.[index]?.pubgName && <p className="text-sm text-destructive mt-1">{form.formState.errors.players[index]?.pubgName?.message}</p>}
                             </div>
                             <div>
                                <Input placeholder={`Player ${index + 1} ID`} {...form.register(`players.${index}.pubgId`, { required: "ID is required."})} />
                                {form.formState.errors.players?.[index]?.pubgId && <p className="text-sm text-destructive mt-1">{form.formState.errors.players[index]?.pubgId?.message}</p>}
                             </div>
                            <Input placeholder="Discord (Optional)" {...form.register(`players.${index}.discordUsername`)} />
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
                     {form.formState.errors.players && <p className="text-sm text-destructive mt-1">{form.formState.errors.players.message}</p>}
                    </div>
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
                        <Button type="button" variant="secondary" disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    if (!isLoggedIn) {
        return <Button size="lg">Register for this Tournament</Button>
    }
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
