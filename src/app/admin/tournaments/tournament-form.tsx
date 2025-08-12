

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createTournament, updateTournament } from '@/lib/actions';
import { tournamentSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

type TournamentFormValues = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  tournamentId?: string;
  defaultValues?: Partial<TournamentFormValues>;
}

export default function TournamentForm({ tournamentId, defaultValues }: TournamentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: defaultValues || {
        name: '',
        date: '',
        prizeDistribution: {
          first: 0,
          second: 0,
          third: 0,
          fourth: 0,
          fifth: 0,
          topKills: 0,
        },
        mode: 'Squads',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: '',
        description: '',
        rules: 'Be respectful to all players and staff.\nNo cheating, scripting, or exploiting bugs.\nAdmins have the final say in all disputes.\nCheck-in is required 30 minutes before the tournament starts.\nTeams must have between 4 and 6 players.',
        registrationOpen: true,
    }
  });
  
  // This is a workaround to ensure the date from Firestore is formatted correctly for the datetime-local input
  useEffect(() => {
    if (defaultValues?.date) {
      const date = new Date(defaultValues.date);
      // Format to YYYY-MM-DDTHH:mm
      const formattedDate = date.toISOString().slice(0, 16);
      form.setValue('date', formattedDate);
    }
  }, [defaultValues, form]);


  const action = tournamentId ? updateTournament : createTournament;

  async function onSubmit(data: TournamentFormValues) {
    let result;
    if (tournamentId) {
      result = await updateTournament(tournamentId, data);
    } else {
      result = await createTournament(data);
    }

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/tournaments');
        router.refresh();
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Tournament Name</Label>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <Label>Date & Time</Label>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <Label>Game Mode</Label>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader><CardTitle>Prize Distribution (Rs)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="prizeDistribution.first" render={({ field }) => (<FormItem><Label>1st Place</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prizeDistribution.second" render={({ field }) => (<FormItem><Label>2nd Place</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prizeDistribution.third" render={({ field }) => (<FormItem><Label>3rd Place</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prizeDistribution.fourth" render={({ field }) => (<FormItem><Label>4th Place</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prizeDistribution.fifth" render={({ field }) => (<FormItem><Label>5th Place</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prizeDistribution.topKills" render={({ field }) => (<FormItem><Label>Top Kills</Label><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <Label>Image URL</Label>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataAiHint"
            render={({ field }) => (
              <FormItem>
                <Label>Image AI Hint</Label>
                <FormControl><Input placeholder="e.g. 'esports battle'" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Label>Description</Label>
              <FormControl><Textarea rows={5} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <Label>Rules</Label>
              <FormControl><Textarea rows={8} placeholder="Enter one rule per line." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="registrationOpen"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Registration Status
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Allow users to register for this tournament.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : (tournamentId ? 'Update Tournament' : 'Create Tournament')}
          </Button>
        </div>
      </form>
    </Form>
  );
}