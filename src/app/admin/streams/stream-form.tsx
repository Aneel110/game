
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createStream, updateStream } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

// Helper to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      return null;
    } catch (error) {
      return null;
    }
};

const streamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  youtubeUrl: z.string().refine(url => getYouTubeVideoId(url) !== null, {
    message: "Must be a valid YouTube video URL (e.g., youtube.com/watch?v=... or youtu.be/...)",
  }),
  status: z.enum(['Live', 'Upcoming', 'Past']),
});

type StreamFormValues = z.infer<typeof streamSchema>;

interface StreamFormProps {
  streamId?: string;
  defaultValues?: Partial<StreamFormValues>;
}

export default function StreamForm({ streamId, defaultValues }: StreamFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<StreamFormValues>({
    resolver: zodResolver(streamSchema),
    defaultValues: defaultValues || {
        title: '',
        youtubeUrl: '',
        status: 'Past',
    }
  });

  const action = streamId ? updateStream.bind(null, streamId) : createStream;

  async function onSubmit(data: StreamFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await action(formData);

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/streams');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Stream Title</Label>
                        <FormControl>
                            <Input placeholder="e.g., Grand Finals - Season 5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-2">
                     <FormField
                        control={form.control}
                        name="youtubeUrl"
                        render={({ field }) => (
                            <FormItem>
                            <Label>YouTube URL</Label>
                            <FormControl>
                                <Input placeholder="e.g., https://www.youtube.com/watch?v=..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                 <Label>Status</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Live">Live</SelectItem>
                                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                                        <SelectItem value="Past">Past</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (streamId ? 'Update Stream' : 'Create Stream')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
