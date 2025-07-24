'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalizedContentRecommendations } from '@/ai/flows/personalized-content-recommendations';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  userProfile: z.string().min(10, {
    message: 'Please describe your interests in at least 10 characters.',
  }),
});

// A mock list of content for the AI to recommend from.
const MOCK_CONTENT_LIST = `
- News: "New Erangel map updates and vehicle physics changes in Patch 25.2"
- News: "Global Championship 2024 dates and prize pool announced"
- Strategy: "Advanced guide to mastering the Mini-14 DMR"
- Strategy: "How to effectively use smoke grenades for offensive plays"
- Forum Post: "Team 'ChickenEaters' is looking for a pro-level IGL. Must have competitive experience."
- Forum Post: "Recruiting for casual squad games on weekday evenings."
`;

export default function RecommendationEngine() {
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations('');
    try {
      const result = await personalizedContentRecommendations({
        userProfile: values.userProfile,
        contentList: MOCK_CONTENT_LIST,
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Describe Your Interests</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="userProfile"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                            For example: &quot;I am a competitive player who prefers long-range combat and wants to find a serious team.&quot;
                            </FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Tell us about your playstyle, what you're looking for, etc."
                                {...field}
                                rows={5}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Get Recommendations
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {recommendations && (
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardHeader>
                        <CardTitle className="text-primary">Here are your personalized recommendations:</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert prose-p:text-foreground/80 prose-li:text-foreground/80 whitespace-pre-wrap">
                            {recommendations}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
