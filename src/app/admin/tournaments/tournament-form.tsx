'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createTournament, updateTournament } from '@/lib/actions';

const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  date: z.string().min(1, 'Date is required.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  status: z.enum(['Upcoming', 'Ongoing', 'Finished']),
  mode: z.string().min(1, 'Mode is required.'),
  image: z.string().url('Image must be a valid URL.'),
  dataAiHint: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

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
        prize: 0,
        status: 'Upcoming',
        mode: 'Squads',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: '',
        description: ''
    }
  });

  const action = tournamentId ? updateTournament.bind(null, tournamentId) : createTournament;

  async function clientAction(formData: FormData) {
    const result = await action(formData);
    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/tournaments');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  return (
    <form action={clientAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Tournament Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name} />
          {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={defaultValues?.date} />
           {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="prize">Prize Pool ($)</Label>
          <Input id="prize" name="prize" type="number" defaultValue={defaultValues?.prize} />
           {form.formState.errors.prize && <p className="text-sm text-destructive">{form.formState.errors.prize.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Finished">Finished</SelectItem>
            </SelectContent>
          </Select>
           {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mode">Game Mode</Label>
           <Input id="mode" name="mode" defaultValue={defaultValues?.mode} />
            {form.formState.errors.mode && <p className="text-sm text-destructive">{form.formState.errors.mode.message}</p>}
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" defaultValue={defaultValues?.image} />
             {form.formState.errors.image && <p className="text-sm text-destructive">{form.formState.errors.image.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataAiHint">Image AI Hint</Label>
            <Input id="dataAiHint" name="dataAiHint" defaultValue={defaultValues?.dataAiHint} placeholder="e.g. 'esports battle'"/>
          </div>
       </div>


      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={defaultValues?.description} />
         {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">
            {tournamentId ? 'Update Tournament' : 'Create Tournament'}
        </Button>
      </div>
    </form>
  );
}
