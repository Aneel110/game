
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createPhoto, updatePhoto } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { photoSchema, type PhotoFormValues } from '@/lib/schemas';
import Image from 'next/image';

interface PhotoFormProps {
  photoId?: string;
  defaultValues?: Partial<PhotoFormValues>;
}

export default function PhotoForm({ photoId, defaultValues }: PhotoFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: defaultValues || {
        title: '',
        imageUrl: '',
    }
  });

  const imageUrl = form.watch('imageUrl');
  const action = photoId ? updatePhoto.bind(null, photoId) : createPhoto;

  async function onSubmit(data: PhotoFormValues) {
    const result = await action(data);

    if(result.success) {
        toast({ title: 'Success', description: result.message });
        router.push('/admin/photos');
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
                        <Input placeholder="e.g., Team Awesome Logo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                    <Label>Image URL</Label>
                    <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            {imageUrl && (
                <div>
                    <Label>Image Preview</Label>
                    <div className="mt-2 w-32 h-32 relative border rounded-md overflow-hidden">
                        <Image src={imageUrl} alt="Preview" layout="fill" objectFit="cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (photoId ? 'Update Photo' : 'Create Photo')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
