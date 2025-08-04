

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Trophy, AlertTriangle, Shield, History } from 'lucide-react';
import { db } from "@/lib/firebase-admin";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timestamp } from 'firebase-admin/firestore';

type Tournament = {
  id: string;
  name: string;
  date: string;
  prizeDistribution: { [key: string]: number };
  image: string;
  dataAiHint?: string;
  status: 'Upcoming' | 'Past';
};

async function getCategorizedTournaments() {
  if (!db) {
    return { success: false, error: "Server-side Firebase is not configured correctly." };
  }
  try {
    const tournamentsSnapshot = await db.collection("tournaments").get();
    const allTournaments: Omit<Tournament, 'status'>[] = [];
    tournamentsSnapshot.forEach((doc) => {
        const docData = doc.data();
        // Ensure date is a string
        const dateString = docData.date instanceof Timestamp 
            ? docData.date.toDate().toISOString() 
            : String(docData.date);

        allTournaments.push({
          id: doc.id, 
          name: docData.name,
          date: dateString,
          prizeDistribution: docData.prizeDistribution || {},
          image: docData.image,
          dataAiHint: docData.dataAiHint,
        });
    });

    const now = new Date();
    const upcoming: Tournament[] = [];
    const past: Tournament[] = [];

    allTournaments.forEach(t => {
      const tournamentDate = new Date(t.date);
      if (tournamentDate > now) {
        upcoming.push({ ...t, status: 'Upcoming' });
      } else {
        past.push({ ...t, status: 'Past' });
      }
    });

    // Sort upcoming tournaments by soonest first, and past tournaments by most recent first
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, data: { upcoming, past } };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return { success: false, error: "Could not connect to the database. Please ensure Firestore is enabled and permissions are correct." };
  }
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
    const getStatusBadge = () => {
        switch (tournament.status) {
            case 'Upcoming':
                return <Badge className="absolute top-4 right-4 bg-blue-500 text-white">Upcoming</Badge>;
            case 'Past':
                return <Badge className="absolute top-4 right-4 bg-gray-500 text-white">Finished</Badge>;
            default:
                return null;
        }
    };

    const totalPrize = Object.values(tournament.prizeDistribution).reduce((sum, val) => sum + (Number(val) || 0), 0);

    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-0 relative">
                <Image src={tournament.image} alt={tournament.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={tournament.dataAiHint} />
                {getStatusBadge()}
            </CardHeader>
            <CardContent className="p-6 flex-grow">
                <CardTitle className="font-headline text-2xl mb-2">{tournament.name}</CardTitle>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <div className="flex items-center mr-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(tournament.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-bold text-lg text-primary">Rs {totalPrize.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/tournaments/${tournament.id}`}>
                        View Details <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default async function TournamentsPage() {
  const { success, data, error } = await getCategorizedTournaments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold">Tournaments</h1>
        <p className="text-muted-foreground mt-2">Find your next challenge. Compete and conquer.</p>
      </div>
      
      {!success && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && data && (
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3 text-primary">
                <Shield /> Upcoming Tournaments
            </h2>
            {data.upcoming.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.upcoming.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                 </div>
            ) : (
                 <Card className="text-center p-8">
                    <CardTitle>No Upcoming Tournaments</CardTitle>
                    <p className="text-muted-foreground mt-2">Check back soon for new challenges!</p>
                </Card>
            )}
          </section>

          <section>
             <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3">
                <History /> Past Tournaments
            </h2>
            {data.past.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.past.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                 </div>
            ) : (
                <Card className="text-center p-8">
                    <CardTitle>No Past Tournaments</CardTitle>
                    <p className="text-muted-foreground mt-2">Historical tournament data will appear here.</p>
                </Card>
            )}
          </section>
        </div>
      )}

      {success && !data && (
         <Card className="text-center p-8">
            <CardTitle>No Tournaments Found</CardTitle>
            <p className="text-muted-foreground mt-2">It seems there are no tournaments at all.</p>
          </Card>
      )}
    </div>
  );
}
