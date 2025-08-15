
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createNews, updateNews } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { newsSchema, type NewsFormValues } from '@/lib/schemas';
import { Textarea } from '@/components/ui/textarea';

interface NewsFormProps {
  newsId?: string;
  defaultValues?: Partial<NewsFormValues>;
}

export default function NewsForm({ newsId, defaultValues }: NewsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: defaultValues || {
        title: '',
        content: '',
    }
  });

  const action = newsId ? updateNews.bind(null, newsId) : createNews;

  async function onSubmit(data: NewsFormValues) {
    const result = await action(data);

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/news');
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
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <Label>Title</Label>
                    <FormControl>
                        <Input placeholder="e.g., New Server Update" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <Label>Content</Label>
                    <FormControl>
                        <Textarea rows={5} placeholder="e.g., We will be performing server maintenance..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (newsId ? 'Update News' : 'Create News')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
