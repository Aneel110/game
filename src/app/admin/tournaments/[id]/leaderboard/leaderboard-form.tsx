
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateLeaderboardEntry } from '@/lib/actions';
import { leaderboardEntrySchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

type LeaderboardFormValues = z.infer<typeof leaderboardEntrySchema>;

interface LeaderboardFormProps {
  tournamentId: string;
  entryPlayerName?: string; // The original player name, used as an ID
  defaultValues?: Partial<LeaderboardFormValues>;
}

export default function LeaderboardForm({ tournamentId, entryPlayerName, defaultValues }: LeaderboardFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardEntrySchema),
    defaultValues: defaultValues || {
        rank: 1,
        player: '',
        points: 0,
        matches: 0,
        kills: 0,
        chickenDinners: 0,
    }
  });

  async function onSubmit(data: LeaderboardFormValues) {
    const result = await createOrUpdateLeaderboardEntry(tournamentId, data, entryPlayerName);

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push(`/admin/tournaments/${tournamentId}/leaderboard`);
        router.refresh(); // To see the changes
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="player"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Player Name</Label>
                            <FormControl>
                                <Input placeholder="e.g., ShadowStriker" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Rank</Label>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Points</Label>
                        <FormControl>
                           <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="matches"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Matches Played</Label>
                        <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="kills"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Total Kills</Label>
                        <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="chickenDinners"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Chicken Dinners</Label>
                        <FormControl>
                           <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (entryPlayerName ? 'Update Entry' : 'Create Entry')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
