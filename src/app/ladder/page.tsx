
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase-admin";
import { unstable_cache } from "next/cache";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type LadderTeam = {
  id: string;
  teamName: string;
  logoUrl?: string;
  points: number;
  rank: number;
};

type TournamentLadder = {
  tournamentId: string;
  tournamentName: string;
  teams: LadderTeam[];
};

const getLadderData = unstable_cache(
  async () => {
    if (!db) {
      return { error: "Firebase Admin is not configured." };
    }
    try {
      const tournamentsSnapshot = await db.collection("tournaments").orderBy('date', 'desc').get();
      const allTournamentLadders: TournamentLadder[] = [];

      for (const tournamentDoc of tournamentsSnapshot.docs) {
        const registrationsSnapshot = await tournamentDoc.ref
          .collection('registrations')
          .where('status', '==', 'approved')
          .where('selected', '==', true)
          .get();
        
        if (registrationsSnapshot.empty) {
            continue; // Skip tournaments with no selected teams
        }

        const tournamentData = tournamentDoc.data();
        const leaderboard = tournamentData.leaderboard || [];
        const leaderboardMap = new Map(leaderboard.map((t: any) => [t.teamName, t]));

        const ladderTeams: Omit<LadderTeam, 'rank'>[] = [];

        registrationsSnapshot.docs.forEach(regDoc => {
          const regData = regDoc.data();
          const leaderboardStats = leaderboardMap.get(regData.teamName) || {};

          ladderTeams.push({
            id: `${tournamentDoc.id}-${regDoc.id}`,
            teamName: regData.teamName,
            logoUrl: leaderboardStats.logoUrl,
            points: leaderboardStats.points || 0,
          });
        });

        // Sort by points descending for this specific tournament
        ladderTeams.sort((a, b) => b.points - a.points);
      
        // Assign rank within the tournament
        const rankedTeams = ladderTeams.map((team, index) => ({
          ...team,
          rank: index + 1,
        }));
        
        allTournamentLadders.push({
            tournamentId: tournamentDoc.id,
            tournamentName: tournamentData.name,
            teams: rankedTeams,
        });

      }

      return { tournaments: allTournamentLadders };
    } catch (error) {
      console.error("Error fetching ladder data:", error);
      return { error: "Failed to fetch ladder data." };
    }
  },
  ['public_ladder'],
  { revalidate: 300, tags: ['tournaments', 'registrations'] } // Revalidate every 5 minutes
);

function LadderTable({ teams, tournamentName }: { teams: LadderTeam[], tournamentName: string }) {
    return (
         <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle>{tournamentName}</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20">
                <TableHead className="text-center w-[100px]">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((p) => (
                <TableRow 
                  key={p.id} 
                  className="border-b-primary/10 hover:bg-primary/10 transition-colors duration-300"
                  style={{ animation: `fadeInUp 0.5s ${(p.rank - 1) * 0.05}s ease-out both` }}
                >
                  <TableCell className="text-center font-bold text-2xl">
                    {p.rank === 1 ? (
                      <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] flex items-center justify-center">
                        <Crown className="w-8 h-8 mr-1" /> {p.rank}
                      </span>
                    ) : p.rank === 2 ? (
                      <span className="text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.7)]">{p.rank}</span>
                    ) : p.rank === 3 ? (
                      <span className="text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.7)]">{p.rank}</span>
                    ) : (
                      <span className="text-muted-foreground">{p.rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/50">
                        <AvatarImage src={p.logoUrl || `https://placehold.co/40x40.png?text=${p.teamName.charAt(0)}`} />
                        <AvatarFallback>{p.teamName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lg">{p.teamName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{p.points.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
    )
}

export default async function LadderPage() {
  const { tournaments, error } = await getLadderData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold">Ladder</h1>
        <p className="text-muted-foreground mt-2">View the competitive ladder rankings by tournament.</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tournaments && tournaments.length > 0 ? (
        <div className="space-y-12">
          {tournaments.map((ladder) => (
            <LadderTable key={ladder.tournamentId} teams={ladder.teams} tournamentName={ladder.tournamentName} />
          ))}
        </div>
      ) : (
         <Card className="text-center p-8 bg-card/50">
            <CardTitle>The Ladder is Empty</CardTitle>
            <p className="text-muted-foreground mt-2">No teams have been selected for any tournament ladders yet. Check back soon!</p>
        </Card>
      )}
    </div>
  );
}
