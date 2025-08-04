
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateSiteSettings } from '@/lib/actions';
import { siteSettingsSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

type SettingsFormValues = z.infer<typeof siteSettingsSchema>;

interface SettingsFormProps {
  defaultValues?: Partial<SettingsFormValues>;
}

export default function SettingsForm({ defaultValues }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: defaultValues || {
        homePageBackground: '',
    }
  });

  async function onSubmit(data: SettingsFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value as string);
      }
    });

    const result = await updateSiteSettings(formData);

    if(result.success) {
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
                name="homePageBackground"
                render={({ field }) => (
                    <FormItem>
                        <Label>Homepage Background Image URL</Label>
                        <FormControl>
                            <Input placeholder="https://example.com/background.png" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </form>
    </Form>
  );
}
