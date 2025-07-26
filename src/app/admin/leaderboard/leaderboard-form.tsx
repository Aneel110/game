
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createLeaderboardEntry, updateLeaderboardEntry } from '@/lib/actions';
import { leaderboardSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

type LeaderboardFormValues = z.infer<typeof leaderboardSchema>;

interface LeaderboardFormProps {
  entryId?: string;
  defaultValues?: Partial<LeaderboardFormValues>;
}

export default function LeaderboardForm({ entryId, defaultValues }: LeaderboardFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardSchema),
    defaultValues: defaultValues || {
        rank: 1,
        player: '',
        points: 0,
        matches: 0,
        chickenDinners: 0,
    }
  });

  const action = entryId ? updateLeaderboardEntry.bind(null, entryId) : createLeaderboardEntry;

  async function onSubmit(data: LeaderboardFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await action(formData);

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/leaderboard');
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
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Points</Label>
                        <FormControl>
                            <Input type="number" {...field} />
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
                            <Input type="number" {...field} />
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
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (entryId ? 'Update Entry' : 'Create Entry')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
