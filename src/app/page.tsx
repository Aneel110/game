
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowRight, Trophy, Users, Newspaper, Signal } from 'lucide-react';
import Link from 'next/link';
import RecommendationEngine from '@/components/ai/recommendation-engine';
import { db } from '@/lib/firebase-admin';

const tournaments = [
  {
    id: '1',
    name: 'Arena Clash: Season 5',
    date: '2024-08-15',
    prize: '$50,000',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'esports battle',
  },
  {
    id: '2',
    name: 'Solo Survival Challenge',
    date: '2024-08-20',
    prize: '$10,000',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'lone soldier',
  },
  {
    id: '3',
    name: 'Duo Destruction Derby',
    date: '2024-08-25',
    prize: '$25,000',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'gaming partners',
  },
    {
    id: '4',
    name: 'Squad Goals Championship',
    date: '2024-09-01',
    prize: '$100,000',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'team victory',
  },
];

const communityPosts = [
  {
    title: 'Patch 25.1 Notes',
    category: 'News',
    icon: Newspaper,
    excerpt: 'The latest patch brings new weapon balances and a map update. See what\'s new!',
  },
  {
    title: 'Top 5 Landing Spots',
    category: 'Strategy',
    icon: Trophy,
    excerpt: 'A pro player breaks down the best places to drop for loot and survival.',
  },
  {
    title: 'Team "Vipers" is Recruiting!',
    category: 'Recruitment',
    icon: Users,
    excerpt: 'We are looking for a dedicated sniper and a fragger to complete our competitive roster.',
  },
];

async function getLiveStream() {
    if (!db) {
        console.log("Live stream check skipped: Firebase Admin not configured.");
        return null;
    }
    try {
        const streamSnapshot = await db.collection('streams').where('status', '==', 'Live').limit(1).get();
        if (streamSnapshot.empty) {
            return null;
        }
        return streamSnapshot.docs[0].data();
    } catch (error) {
        console.error("Error fetching live stream:", error);
        return null;
    }
}

async function LiveStreamSection() {
    const liveStream = await getLiveStream();

    if (!liveStream) {
        return null; // Don't render the section if no one is live
    }

    return (
        <section id="live" className="w-full bg-destructive/80 py-12 text-white">
            <div className="container mx-auto text-center">
                 <h2 className="text-4xl font-headline font-bold mb-2 flex items-center justify-center gap-3">
                    <Signal className="animate-pulse" /> LIVE NOW
                </h2>
                <p className="mb-6 text-destructive-foreground">{liveStream.title}</p>
                <div className="aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden border-4 border-destructive-foreground shadow-2xl">
                    <iframe
                        width="100%"
                        height="100%"
                        src={liveStream.youtubeUrl}
                        title={liveStream.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>
    );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="PUBG Arena hero background"
            data-ai-hint="battle royale landscape"
            layout="fill"
            objectFit="cover"
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="z-10 flex flex-col items-center p-4">
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 text-shadow-lg animate-fade-in-down">
            Welcome to PUBG Arena
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl text-foreground/80">
            The ultimate hub for competitive players. Join tournaments, climb the leaderboards, and become a legend.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Link href="/tournaments">Find Tournaments <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 font-bold">
              <Link href="/leaderboards">View Leaderboards</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stream Section */}
      <LiveStreamSection />

      {/* Featured Tournaments Section */}
      <section id="tournaments" className="w-full max-w-7xl py-16 px-4">
        <h2 className="text-4xl font-headline font-bold text-center mb-10">Featured Tournaments</h2>
        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent>
            {tournaments.map((tournament) => (
              <CarouselItem key={tournament.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                  <CardHeader className="p-0">
                    <Image
                      src={tournament.image}
                      alt={tournament.name}
                      data-ai-hint={tournament.dataAiHint}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-headline font-bold mb-2">{tournament.name}</h3>
                    <p className="text-muted-foreground mb-2">{tournament.date}</p>
                    <p className="text-2xl font-bold text-primary mb-4">{tournament.prize}</p>
                    <Button asChild className="w-full">
                      <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>

      {/* AI Recommendation Section */}
      <section id="recommendations" className="w-full bg-background/50 py-16">
        <div className="w-full max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-headline font-bold text-center mb-10">Personalized For You</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-3xl mx-auto">
              Our AI can help you find the most relevant news, strategies, and team recruitment posts. Just tell us a bit about your playstyle or what you're looking for.
            </p>
            <RecommendationEngine />
        </div>
      </section>

      {/* Community Hub Section */}
      <section id="community" className="w-full max-w-7xl py-16 px-4">
        <h2 className="text-4xl font-headline font-bold text-center mb-10">Community Hub</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {communityPosts.map((post, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <post.icon className="h-8 w-8 text-primary" />
                  <div className='flex flex-col'>
                    <span className="text-sm font-normal text-muted-foreground">{post.category}</span>
                    <span className='text-xl font-bold'>{post.title}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
