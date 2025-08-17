
'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

async function getLadderData() {
  const response = await fetch('/api/ladder');
  if (!response.ok) {
    throw new Error('Failed to fetch ladder data');
  }
  return response.json();
}

function LadderSkeleton() {
    return (
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-[100px]">Rank</TableHead>
              <TableHead>Team</TableHead>
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
                <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
}

function LadderTable({ teams, tournamentName }: { teams: LadderTeam[], tournamentName: string }) {
     if (teams.length === 0) {
        return (
            <Card className="text-center p-8 bg-card/50">
                <p className="text-muted-foreground mt-2">This tournament does not have a ladder configured yet.</p>
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

export default function LadderDisplay() {
  const [ladders, setLadders] = useState<TournamentLadder[]>([]);
  const [selectedLadder, setSelectedLadder] = useState<TournamentLadder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        try {
            const data = await getLadderData();
            setLadders(data);
            if (data.length > 0) {
                setSelectedLadder(data[0]);
            }
        } catch (err) {
            setError("Failed to load ladder data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleTournamentChange = (tournamentId: string) => {
    const ladder = ladders.find(l => l.tournamentId === tournamentId);
    if (ladder) {
        setSelectedLadder(ladder);
    }
  };

  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <LadderSkeleton />
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

  if (ladders.length === 0) {
    return (
         <Card className="text-center p-8 bg-card/50">
            <p className="text-muted-foreground mt-2">No ladders are available to display.</p>
          </Card>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <Select onValueChange={handleTournamentChange} defaultValue={selectedLadder?.tournamentId}>
          <SelectTrigger className="w-[300px] md:w-[500px] text-lg py-6">
            <SelectValue placeholder="Select a tournament..." />
          </SelectTrigger>
          <SelectContent>
            {ladders.map(l => (
              <SelectItem key={l.tournamentId} value={l.tournamentId}>{l.tournamentName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedLadder ? (
        <LadderTable teams={selectedLadder.teams} tournamentName={selectedLadder.tournamentName} />
      ) : (
        <p>Please select a tournament to view its ladder.</p>
      )}

    </div>
  );
}
