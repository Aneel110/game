'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
    rank: number;
    teamName: string;
    points: number;
    matches: number;
    kills: number;
    chickenDinners: number;
    logoUrl?: string;
}

type Tournament = {
    id: string;
    name: string;
    leaderboard: LeaderboardEntry[];
}

function LeaderboardSkeleton() {
    return (
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-[100px]">Rank</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Matches</TableHead>
              <TableHead className="text-center">Kills</TableHead>
              <TableHead className="text-center">Chicken Dinners</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
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
                        <AvatarImage src={p.logoUrl || `https://placehold.co/40x40.png?text=${p.teamName.charAt(0)}`} />
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

export default function LeaderboardDisplay({ initialTournaments }: { initialTournaments: Tournament[] }) {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (tournaments.length > 0) {
        // Sort leaderboard by points before setting
        const firstTournament = tournaments[0];
        const sortedLeaderboard = firstTournament.leaderboard.sort((a: any, b: any) => b.points - a.points);
        setSelectedTournament({ ...firstTournament, leaderboard: sortedLeaderboard });
    }
  }, [tournaments]);

  const handleTournamentChange = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
        const sortedLeaderboard = tournament.leaderboard.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.chickenDinners !== a.chickenDinners) return b.chickenDinners - a.chickenDinners;
          return b.kills - a.kills;
        });
        setSelectedTournament({ ...tournament, leaderboard: sortedLeaderboard });
    }
  };

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
        <LeaderboardSkeleton />
      )}

    </div>
  );
}