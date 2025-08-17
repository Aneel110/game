
import { Trophy, AlertTriangle } from "lucide-react";
import LeaderboardDisplay from "./leaderboard-display";
import { db } from "@/lib/firebase-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { unstable_cache } from "next/cache";

const getFinishedTournaments = unstable_cache(
  async () => {
    if (!db) {
      console.error("Firebase Admin is not configured.");
      return { tournaments: [], error: "Server not configured." };
    }
    try {
      const tournamentsSnapshot = await db.collection("tournaments").get();
      const now = new Date();
      
      const finishedTournaments = tournamentsSnapshot.docs
          .map(doc => {
              const data = doc.data();
              return { 
                id: doc.id, 
                name: data.name,
                leaderboard: data.leaderboard || [],
                date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
              }
          })
          .filter(t => t.date && new Date(t.date) < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { tournaments: finishedTournaments, error: null };
    } catch (error) {
      console.error("Error fetching finished tournaments:", error);
      return { tournaments: [], error: "Failed to fetch tournament data." };
    }
  },
  ['finished_tournaments_leaderboard'],
  { revalidate: 300, tags: ['tournaments'] }
)


export default async function LeaderboardsPage() {
  const { tournaments, error } = await getFinishedTournaments();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold flex items-center justify-center gap-4 text-shadow-lg animate-fade-in-down">
          <Trophy className="w-12 h-12 text-primary animate-pulse" />
          Free Pubg Tournament
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
           Browse the leaderboards from our free PUBG tournaments.
        </p>
      </div>

       {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <LeaderboardDisplay initialTournaments={tournaments} />
      
    </div>
  );
}
