
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Trophy, Users, Newspaper, Signal, AlertTriangle, Youtube, Gamepad2, Crown, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timestamp } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NewsSection from '@/components/home/news-section';


const getCachedSiteSettings = unstable_cache(
    async () => {
        if (!db) return null;
        const settingsRef = db.collection('settings').doc('siteSettings');
        const settingsSnap = await settingsRef.get();
        if (settingsSnap.exists) {
            return settingsSnap.data();
        }
        return null;
    },
    ['site_settings'],
    { revalidate: 60 }
);

async function getSiteSettings() {
    const defaults = { 
        siteName: 'E-Sports Nepal',
        siteSlogan: 'Your one-stop destination for E-Sports tournaments, community, and stats in Nepal.',
        homePageBackground: 'https://placehold.co/1920x1080.png' 
    };

    try {
        const data = await getCachedSiteSettings();
        if (data) {
            return {
                siteName: data.siteName || defaults.siteName,
                siteSlogan: data.siteSlogan || defaults.siteSlogan,
                homePageBackground: data.homePageBackground || defaults.homePageBackground
            };
        }
        return defaults;
    } catch (e) {
        console.error("Could not fetch site settings", e);
        return defaults;
    }
}


const getCachedLiveStream = unstable_cache(
    async () => {
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
    },
    ['live_stream'],
    { revalidate: 60 }
)

const getCachedUpcomingTournaments = unstable_cache(
    async () => {
         if (!db) {
            return { tournaments: [], error: "Server-side Firebase is not configured correctly." };
        }
        try {
            const now = new Date();
            const snapshot = await db.collection('tournaments')
                .orderBy('date', 'asc')
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
            }).filter(t => new Date(t.date) > now).slice(0, 6);

            return { tournaments };
        } catch (error: any) {
            console.error("Error fetching upcoming tournaments:", error);
            return { tournaments: [], error: "Failed to fetch tournaments." };
        }
    },
    ['upcoming_tournaments'],
    { revalidate: 60, tags: ['tournaments'] }
);

const getCachedPastStreams = unstable_cache(
    async () => {
        if (!db) {
            return { streams: [], error: "Server-side Firebase is not configured correctly." };
        }
        try {
            const snapshot = await db.collection('streams')
                .where('status', '==', 'Past')
                .limit(4)
                .get();
            
            if (snapshot.empty) {
                return { streams: [] };
            }
            const streams = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return { id: doc.id, ...data };
            });
            return { streams };
        } catch (error: any) {
            console.error("Error fetching past streams:", error);
            return { streams: [], error: "Failed to fetch past streams." };
        }
    },
    ['past_streams'],
    { revalidate: 300, tags: ['streams'] }
);

const getCachedRecentWinners = unstable_cache(
    async () => {
        if (!db) return { winners: [], tournamentName: null };

        const now = new Date();
        const snapshot = await db.collection('tournaments')
            .where('date', '<', now)
            .orderBy('date', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return { winners: [], tournamentName: null };

        const latestTournament = snapshot.docs[0].data();
        const leaderboard = latestTournament.leaderboard || [];

        const winners = leaderboard
            .sort((a: any, b: any) => b.points - a.points)
            .slice(0, 3)
            .map((team: any, index: number) => ({ ...team, rank: index + 1}));
        
        return { winners, tournamentName: latestTournament.name };
    },
    ['recent_winners'],
    { revalidate: 3600, tags: ['tournaments'] }
);

const getCachedNews = unstable_cache(
    async () => {
        if (!db) {
            return { news: [], error: "Server-side Firebase is not configured correctly." };
        }
        try {
            const snapshot = await db.collection('news').orderBy('createdAt', 'desc').limit(5).get();
            if (snapshot.empty) {
                return { news: [] };
            }
            const news = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    content: data.content,
                }
            });
            return { news };
        } catch (error: any) {
            console.error("Error fetching news:", error);
            return { news: [], error: "Failed to fetch news." };
        }
    },
    ['news'],
    { revalidate: 60, tags: ['news'] }
);

async function LiveStreamSection() {
    const { stream: liveStream, error } = await getCachedLiveStream();

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

function getWatchUrl(embedUrl: string) {
    const videoId = embedUrl.split('/').pop();
    return `https://www.youtube.com/watch?v=${videoId}`;
}


function VideoPreviewCard({ stream }: { stream: any }) {
    const videoId = stream.youtubeUrl.split('/').pop();
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const watchUrl = getWatchUrl(stream.youtubeUrl);

    return (
        <Link href={watchUrl} target="_blank" rel="noopener noreferrer">
            <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group">
                <CardHeader className="p-0 relative">
                    <Image src={thumbnailUrl} alt={stream.title} width={600} height={400} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Youtube className="w-16 h-16 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <h3 className="text-md font-semibold line-clamp-2">{stream.title}</h3>
                </CardContent>
            </Card>
        </Link>
    )
}

async function YouTubeVideosSection() {
    const { streams, error } = await getCachedPastStreams();

    if (error) {
         return (
            <div className="container mx-auto">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Could not load videos</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (streams.length === 0) {
        return null;
    }

    return (
         <section id="youtube" className="w-full bg-card py-16">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-headline font-bold text-center mb-4">Visit our YouTube Channel</h2>
                <p className="text-muted-foreground mb-8">
                    Catch all the highlights, full matches, and exclusive content.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {streams.map((stream) => (
                        <VideoPreviewCard key={stream.id} stream={stream} />
                    ))}
                </div>
                 <Button asChild size="lg">
                    <Link href="https://www.youtube.com/@esportsnepall" target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-5 w-5" />
                        See More on YouTube
                    </Link>
                </Button>
                
                <div className="mt-16">
                    <Card className="bg-muted/50 border-dashed border-2 p-8 text-center">
                         <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">Advertisement</h4>
                    </Card>
                </div>
            </div>
        </section>
    )
}

function WinnerCard({ team, rank }: { team: any, rank: number }) {
    const rankColors: any = {
        1: "border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20",
        2: "border-gray-400/50 bg-gray-400/10 hover:bg-gray-400/20",
        3: "border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20",
    }
    const rankIconColors: any = {
        1: "text-yellow-400",
        2: "text-gray-400",
        3: "text-orange-400",
    }
    return (
        <Card className={`text-center p-4 transition-all duration-300 ${rankColors[rank]}`}>
            <Crown className={`w-8 h-8 mx-auto mb-2 ${rankIconColors[rank]}`} />
            <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-primary/50">
                <AvatarImage src={team.logoUrl || `https://placehold.co/64x64.png?text=${team.teamName.charAt(0)}`} />
                <AvatarFallback>{team.teamName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-bold text-lg">{team.teamName}</p>
            <p className="text-sm text-muted-foreground">#{rank} Place</p>
            <p className="text-xl font-bold text-primary mt-1">{team.points} Points</p>
        </Card>
    )
}

async function RecentWinnersSection() {
    const { winners, tournamentName } = await getCachedRecentWinners();

    if (winners.length === 0) return null;

    return (
        <section id="winners" className="w-full bg-background py-16">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-headline font-bold text-center mb-2">Recent Winners</h2>
                <p className="text-muted-foreground mb-8">
                    Congratulations to the champions of the {tournamentName}!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {winners.map(team => (
                        <WinnerCard key={team.teamName} team={team} rank={team.rank}/>
                    ))}
                </div>
            </div>
        </section>
    )
}


export default async function Home() {
  const settings = await getSiteSettings();
  const { tournaments, error: tournamentsError } = await getCachedUpcomingTournaments();
  const { news, error: newsError } = await getCachedNews();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full h-[80vh] md:h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={settings?.homePageBackground || 'https://placehold.co/1920x1080.png'}
            alt="E-Sports Nepal hero background"
            data-ai-hint="battle royale landscape"
            fill
            className="opacity-40 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="z-10 flex flex-col items-center p-4">
          <h1 className="text-4xl md:text-7xl font-headline font-bold mb-4 text-shadow-lg animate-fade-in-down">
            {settings?.siteName || 'E-Sports Nepal'}
          </h1>
          <p className="text-md md:text-xl mb-8 max-w-2xl text-foreground/80">
            {settings?.siteSlogan || 'Your one-stop destination for E-Sports tournaments, community, and stats in Nepal.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Link href="/tournaments">Find Tournaments <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stream Section */}
      <LiveStreamSection />
      
      {/* News Section */}
      <NewsSection news={news} error={newsError} />

      {/* Upcoming Tournaments Section */}
      <section id="tournaments" className="w-full max-w-7xl py-16 px-4">
        <h2 className="text-4xl font-headline font-bold text-center mb-10">Upcoming Tournaments</h2>
        {tournamentsError && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could not load tournaments</AlertTitle>
                <AlertDescription>{tournamentsError}</AlertDescription>
            </Alert>
        )}
        {tournaments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                    <Card key={tournament.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
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
                ))}
              </div>
        ) : !tournamentsError && (
             <Card className="text-center p-8">
                <CardTitle>No Upcoming Tournaments</CardTitle>
                <p className="text-muted-foreground mt-2">Check back soon for new challenges!</p>
            </Card>
        )}
      </section>

      {/* Recent Winners Section */}
      <RecentWinnersSection />

      {/* YouTube Section */}
      <YouTubeVideosSection />


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
