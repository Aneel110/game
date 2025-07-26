
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Drumstick, Swords, Trophy, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getLeaderboardData() {
  if (!db) {
    return { success: false, error: "Could not connect to the database. Please ensure Firestore is enabled and service account is set." };
  }
  try {
    const leaderboardSnapshot = await db.collection("leaderboard").orderBy("rank", "asc").get();
    const data: any[] = [];
    leaderboardSnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { success: false, error: "Could not connect to the database. Please ensure Firestore is enabled in your Firebase project." };
  }
}

export default async function LeaderboardsPage() {
  const { success, data: leaderboardData, error } = await getLeaderboardData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold flex items-center justify-center gap-4 text-shadow-lg animate-fade-in-down">
          <Trophy className="w-12 h-12 text-primary animate-pulse" />
          HALL OF FAME
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">See who's dominating the arena.</p>
      </div>

       {!success && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            {error} Please follow the setup instructions to enable Firestore in the Firebase Console.
          </AlertDescription>
        </Alert>
      )}

      {leaderboardData && leaderboardData.length > 0 && (
        <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20">
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20">
                <TableHead className="text-center w-[100px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Matches</TableHead>
                <TableHead className="text-center">Chicken Dinners</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((p, index) => (
                <TableRow 
                  key={p.rank} 
                  className="border-b-primary/10 hover:bg-primary/10 transition-colors duration-300"
                  style={{ animation: `fadeInUp 0.5s ${index * 0.05}s ease-out both` }}
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
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${p.player.charAt(0)}`} />
                        <AvatarFallback>{p.player.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lg">{p.player}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-lg flex items-center justify-center gap-2">
                    <Swords className="w-5 h-5 text-muted-foreground" />
                    {p.matches}
                  </TableCell>
                  <TableCell className="text-center font-mono text-lg flex items-center justify-center gap-2">
                     <Drumstick className="w-5 h-5 text-amber-500" />
                    {p.chickenDinners}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{p.points.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {success && leaderboardData?.length === 0 && (
         <Card className="text-center p-8 bg-card/50">
            <CardTitle>No Leaderboard Data</CardTitle>
            <p className="text-muted-foreground mt-2">It looks like the database is empty. Have you seeded the data from the admin dashboard?</p>
          </Card>
      )}
    </div>
  );
}
