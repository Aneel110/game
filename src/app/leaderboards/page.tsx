import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Card } from "@/components/ui/card";

async function getLeaderboardData() {
    const q = query(collection(db, "leaderboard"), orderBy("rank", "asc"));
    const querySnapshot = await getDocs(q);
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}


const getTierColor = (tier: string) => {
  if (tier === 'Conqueror') return 'text-red-400';
  if (tier.includes('Ace')) return 'text-orange-400';
  if (tier === 'Crown') return 'text-yellow-400';
  if (tier === 'Diamond') return 'text-blue-400';
  return 'text-muted-foreground';
}

export default async function LeaderboardsPage() {
  const leaderboardData = await getLeaderboardData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold flex items-center justify-center gap-4">
          <Trophy className="w-12 h-12 text-primary" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground mt-2">See who's dominating the arena.</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Tier</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Wins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((p) => (
              <TableRow key={p.rank} className="hover:bg-primary/5">
                <TableCell className="text-center font-bold text-lg">
                  {p.rank <= 3 ? (
                    <span className={p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-gray-300' : 'text-orange-400'}>
                      {p.rank}
                    </span>
                  ) : (
                    p.rank
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${p.player.charAt(0)}`} />
                      <AvatarFallback>{p.player.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.player}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`font-bold ${getTierColor(p.tier)} border-current`}>
                    {p.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{p.points.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{p.wins}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
