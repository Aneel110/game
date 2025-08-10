
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateFinalistLeaderboard } from '@/lib/actions';
import { finalistFormSchema, type FinalistFormValues } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinalistFormProps {
  tournamentId: string;
  defaultValues: Partial<FinalistFormValues>;
  approvedTeams: string[];
}

export default function FinalistForm({ tournamentId, defaultValues, approvedTeams }: FinalistFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<FinalistFormValues>({
    resolver: zodResolver(finalistFormSchema),
    defaultValues: {
        finalistLeaderboardActive: defaultValues.finalistLeaderboardActive || false,
        finalistLeaderboard: defaultValues.finalistLeaderboard || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'finalistLeaderboard',
  });

  async function onSubmit(data: FinalistFormValues) {
    const result = await updateFinalistLeaderboard(tournamentId, data);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
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
          name="finalistLeaderboardActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Finalist Leaderboard</FormLabel>
                <p className="text-sm text-muted-foreground">Make the finalist leaderboard visible on the tournament page.</p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Finalist Teams</Label>
            {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row items-end gap-2 p-4 border rounded-md relative">
                     <div className="absolute top-2 left-4 text-xs font-bold text-muted-foreground">Rank #{index + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow pt-4 w-full">
                        <FormField
                            control={form.control}
                            name={`finalistLeaderboard.${index}.teamName`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a team" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {approvedTeams.map(team => (
                                                <SelectItem key={team} value={team}>{team}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`finalistLeaderboard.${index}.logoUrl`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/logo.png" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow pt-4 w-full">
                         <FormField control={form.control} name={`finalistLeaderboard.${index}.points`} render={({ field }) => ( <FormItem><FormLabel>Points</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name={`finalistLeaderboard.${index}.matches`} render={({ field }) => ( <FormItem><FormLabel>Matches</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name={`finalistLeaderboard.${index}.kills`} render={({ field }) => ( <FormItem><FormLabel>Kills</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name={`finalistLeaderboard.${index}.chickenDinners`} render={({ field }) => ( <FormItem><FormLabel>Wins</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ teamName: '', logoUrl: '', points: 0, matches: 0, kills: 0, chickenDinners: 0, rank: 0 })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Finalist Team
            </Button>
        </div>


        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Finalist Leaderboard'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
