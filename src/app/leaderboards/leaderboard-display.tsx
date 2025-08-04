
'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
    rank: number;
    teamName: string;
    points: number;
    matches: number;
    kills: number;
    chickenDinners: number;
}

type Tournament = {
    id: string;
    name: string;
    leaderboard: LeaderboardEntry[];
}

// This would typically be a server action or API call
async function getFinishedTournamentsWithLeaderboards() {
  // In a real app, this should be fetched from a server action to avoid exposing all tournament data.
  // For this prototype, we are fetching it on the client for interactivity.
  const response = await fetch('/api/finished-tournaments');
  if (!response.ok) {
    throw new Error('Failed to fetch tournaments');
  }
  return response.json();
}

function LeaderboardTable({ leaderboardData }: { leaderboardData: LeaderboardEntry[] }) {
     if (leaderboardData.length === 0) {
        return (
            <Card className="text-center p-8 bg-card/50">
                <p className="text-muted-foreground mt-2">This tournament does not have a leaderboard yet.</p>
            </Card>
        )
    }
    
    return (
         <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20">
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20">
                <TableHead className="text-center w-[100px]">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Matches</TableHead>
                <TableHead className="text-center">Kills</TableHead>
                <TableHead className="text-center">Chicken Dinners</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((p: any, index) => {
                const rank = index + 1;
                return (
                <TableRow 
                  key={p.teamName} 
                  className="border-b-primary/10 hover:bg-primary/10 transition-colors duration-300"
                  style={{ animation: `fadeInUp 0.5s ${index * 0.05}s ease-out both` }}
                >
                  <TableCell className="text-center font-bold text-2xl">
                    {rank === 1 ? (
                      <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] flex items-center justify-center">
                        <Crown className="w-8 h-8 mr-1" /> {rank}
                      </span>
                    ) : rank === 2 ? (
                      <span className="text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.7)]">{rank}</span>
                    ) : rank === 3 ? (
                      <span className="text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.7)]">{rank}</span>
                    ) : (
                      <span className="text-muted-foreground">{rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/50">
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${p.teamName.charAt(0)}`} />
                        <AvatarFallback>{p.teamName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lg">{p.teamName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-lg">
                    {p.matches}
                  </TableCell>
                  <TableCell className="text-center font-mono text-lg">
                    {p.kills}
                  </TableCell>
                  <TableCell className="text-center font-mono text-lg">
                    {p.chickenDinners}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{p.points.toLocaleString()}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </Card>
    )
}

export default function LeaderboardDisplay() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        try {
            const data = await getFinishedTournamentsWithLeaderboards();
            setTournaments(data);
            if (data.length > 0) {
                // Sort leaderboard by points before setting
                const sortedLeaderboard = data[0].leaderboard.sort((a: any, b: any) => b.points - a.points);
                setSelectedTournament({ ...data[0], leaderboard: sortedLeaderboard });
            }
        } catch (err) {
            setError("Failed to load leaderboards. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleTournamentChange = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
        const sortedLeaderboard = tournament.leaderboard.sort((a, b) => b.points - a.points);
        setSelectedTournament({ ...tournament, leaderboard: sortedLeaderboard });
    }
  };

  if (loading) {
    return (
        <div>
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  if (error) {
    return (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (tournaments.length === 0) {
    return (
         <Card className="text-center p-8 bg-card/50">
            <p className="text-muted-foreground mt-2">No finished tournaments with leaderboards found.</p>
          </Card>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <Select onValueChange={handleTournamentChange} defaultValue={selectedTournament?.id}>
          <SelectTrigger className="w-[300px] md:w-[500px] text-lg py-6">
            <SelectValue placeholder="Select a tournament..." />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedTournament ? (
        <LeaderboardTable leaderboardData={selectedTournament.leaderboard} />
      ) : (
        <p>Please select a tournament to view its leaderboard.</p>
      )}

    </div>
  );
}
