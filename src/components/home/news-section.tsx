
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Megaphone } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

type NewsItem = {
    id: string;
    title: string;
    content: string;
}

interface NewsSectionProps {
    news: NewsItem[];
    error: string | null;
}

export default function NewsSection({ news, error }: NewsSectionProps) {
    if (error) {
        return (
            <Alert variant="destructive" className="my-8 container">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could not load news</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (news.length === 0) {
        return null;
    }

    return (
        <section id="news" className="w-full bg-muted/30 py-12">
            <div className="container mx-auto">
                <h2 className="text-4xl font-headline font-bold text-center mb-8 flex items-center justify-center gap-3">
                    <Megaphone className="w-8 h-8 text-primary" /> Important News
                </h2>
                <Carousel 
                    className="w-full max-w-4xl mx-auto"
                    plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                    opts={{ loop: true }}
                >
                    <CarouselContent>
                        {news.map((item) => (
                            <CarouselItem key={item.id}>
                                <Card className="p-6 text-center bg-card/80 backdrop-blur-sm border-primary/20">
                                    <CardTitle className="mb-2 text-2xl font-headline text-primary">{item.title}</CardTitle>
                                    <CardDescription className="text-base text-foreground/80">{item.content}</CardDescription>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
        </section>
    );
}
