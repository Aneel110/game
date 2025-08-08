
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
        siteName: '',
        siteSlogan: '',
        homePageBackground: '',
        socialLinks: {
            twitter: '',
            discord: '',
            youtube: '',
            twitch: '',
            tiktok: '',
        }
    }
  });

  async function onSubmit(data: SettingsFormValues) {
    const result = await updateSiteSettings(data);

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
             <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Site Name</Label>
                                <FormControl>
                                    <Input placeholder="E-Sports Nepal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Homepage</CardTitle>
                    <CardDescription>Customize the look and feel of your homepage hero section.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
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
                     <FormField
                        control={form.control}
                        name="siteSlogan"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Homepage Slogan</Label>
                                <FormControl>
                                    <Textarea placeholder="The ultimate hub for competitive players..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Enter the full URLs for your social media profiles.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="socialLinks.twitter" render={({ field }) => (<FormItem><Label>Twitter / X</Label><FormControl><Input placeholder="https://twitter.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="socialLinks.discord" render={({ field }) => (<FormItem><Label>Discord</Label><FormControl><Input placeholder="https://discord.gg/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="socialLinks.youtube" render={({ field }) => (<FormItem><Label>YouTube</Label><FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="socialLinks.twitch" render={({ field }) => (<FormItem><Label>Twitch</Label><FormControl><Input placeholder="https://twitch.tv/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="socialLinks.tiktok" render={({ field }) => (<FormItem><Label>TikTok</Label><FormControl><Input placeholder="https://tiktok.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>
        </form>
    </Form>
  );
}
