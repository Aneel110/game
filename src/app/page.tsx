
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowRight, Trophy, Users, Newspaper, Signal, AlertTriangle, Youtube, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timestamp } from 'firebase-admin/firestore';

async function getSiteSettings() {
    if (!db) {
        return { 
            siteName: 'PUBG Arena',
            siteSlogan: 'It is Free Pubg Tournament',
            homePageBackground: 'https://placehold.co/1920x1080.png' 
        };
    }
    try {
        const settingsRef = db.collection('settings').doc('siteSettings');
        const settingsSnap = await settingsRef.get();
        if (settingsSnap.exists) {
            const data = settingsSnap.data()
            return {
                siteName: data?.siteName || 'PUBG Arena',
                siteSlogan: data?.siteSlogan || 'It is Free Pubg Tournament',
                homePageBackground: data?.homePageBackground || 'https://placehold.co/1920x1080.png'
            }
        }
        return { 
            siteName: 'PUBG Arena',
            siteSlogan: 'It is Free Pubg Tournament',
            homePageBackground: 'https://placehold.co/1920x1080.png' 
        };
    } catch (e) {
        console.error("Could not fetch site settings", e);
        return { 
            siteName: 'PUBG Arena',
            siteSlogan: 'It is Free Pubg Tournament',
            homePageBackground: 'https://placehold.co/1920x1080.png'
        };
    }
}

async function getLiveStream() {
    if (!db) {
        return { error: "Server-side Firebase is not configured correctly." };
    }
    try {
        const streamSnapshot = await db.collection('streams').where('status', '==', 'Live').limit(1).get();
        if (streamSnapshot.empty) {
            return { stream: null };
        }
        const streamDoc = streamSnapshot.docs[0];
        return { stream: { id: streamDoc.id, ...streamDoc.data() } };
    } catch (error: any) {
        console.error("Error fetching live stream:", error);
        return { error: "Failed to fetch live stream. Ensure Firestore is enabled and permissions are correct." };
    }
}

async function getFeaturedTournaments() {
  if (!db) {
    return { tournaments: [], error: "Server-side Firebase is not configured correctly." };
  }
  try {
    const now = new Date();
    const snapshot = await db.collection('tournaments')
        .where('date', '>', now) // Use native Date object for comparison
        .orderBy('date', 'asc')
        .limit(6)
        .get();

    if (snapshot.empty) {
        return { tournaments: [] };
    }
    const tournaments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
            prizeDistribution: data.prizeDistribution || {},
            image: data.image,
            dataAiHint: data.dataAiHint || ''
        }
    });
    return { tournaments };
  } catch (error: any) {
     console.error("Error fetching featured tournaments:", error);
     return { tournaments: [], error: "Failed to fetch tournaments." };
  }
}

async function LiveStreamSection() {
    const { stream: liveStream, error } = await getLiveStream();

    if (error) {
       return (
        <section className="w-full bg-card py-8">
            <div className="container mx-auto">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Could not load live stream</AlertTitle>
                    <AlertDescription>
                        {error} Please ensure your `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly in your environment variables.
                    </AlertDescription>
                </Alert>
            </div>
        </section>
       )
    }

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

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
)

export default async function Home() {
  const settings = await getSiteSettings();
  const { tournaments, error: tournamentsError } = await getFeaturedTournaments();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full h-[80vh] md:h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={settings?.homePageBackground || 'https://placehold.co/1920x1080.png'}
            alt="PUBG Arena hero background"
            data-ai-hint="battle royale landscape"
            fill
            className="opacity-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="z-10 flex flex-col items-center p-4">
          <h1 className="text-4xl md:text-7xl font-headline font-bold mb-4 text-shadow-lg animate-fade-in-down">
            {settings?.siteName || 'Welcome to PUBG Arena'}
          </h1>
          <p className="text-md md:text-xl mb-8 max-w-2xl text-foreground/80">
            {settings?.siteSlogan || 'It is Free Pubg Tournament'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
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
        {tournamentsError && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could not load tournaments</AlertTitle>
                <AlertDescription>{tournamentsError}</AlertDescription>
            </Alert>
        )}
        {tournaments.length > 0 ? (
            <Carousel opts={{ align: 'start', loop: tournaments.length > 2 }} className="w-full">
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
                        <p className="text-muted-foreground mb-2">{new Date(tournament.date).toLocaleDateString()}</p>
                        <p className="text-2xl font-bold text-primary">Rs {Object.values(tournament.prizeDistribution).reduce((a, b) => a + b, 0).toLocaleString()}</p>
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
        ) : !tournamentsError && (
             <Card className="text-center p-8">
                <CardTitle>No Upcoming Tournaments</CardTitle>
                <p className="text-muted-foreground mt-2">Check back soon for new challenges!</p>
            </Card>
        )}
      </section>

      {/* YouTube Section */}
      <section id="youtube" className="w-full bg-card py-16">
        <div className="container mx-auto text-center">
            <h2 className="text-4xl font-headline font-bold text-center mb-4">Visit our YouTube Channel</h2>
            <p className="text-muted-foreground mb-8">
                Catch all the highlights, full matches, and exclusive content.
            </p>
            <Button asChild size="lg">
                <Link href="https://www.youtube.com/@esportsnepall" target="_blank" rel="noopener noreferrer">
                    <Youtube className="mr-2 h-5 w-5" />
                    Watch on YouTube
                </Link>
            </Button>
        </div>
      </section>

      {/* Social Section */}
      <section id="social" className="w-full bg-background py-16">
        <div className="container mx-auto text-center">
            <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl font-headline font-bold text-center mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-8">
                Follow us on our social channels to stay updated with the latest news and events.
            </p>
            <Button asChild size="lg" variant="outline">
                <Link href="https://www.facebook.com/profile.php?id=61550283428123&rdid=wBoxtMJNpF9vhRyK" target="_blank" rel="noopener noreferrer">
                    <FacebookIcon className="mr-2 h-5 w-5" />
                    Follow on Facebook
                </Link>
            </Button>
        </div>
      </section>

    </div>
  );
}
