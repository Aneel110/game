
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import DeleteLeaderboardButton from "./delete-leaderboard-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";

type LeaderboardEntry = {
    id: string; // This will be the player's name for simplicity if we don't have unique IDs per entry
    rank: number;
    player: string;
    points: number;
    matches: number;
    chickenDinners: number;
}

async function getTournamentLeaderboard(tournamentId: string) {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." }
    }
    const tournamentRef = db.collection('tournaments').doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();

    if (!tournamentSnap.exists) {
        return { tournament: null };
    }
    
    const tournamentData = tournamentSnap.data();
    const leaderboard = (tournamentData?.leaderboard || []).sort((a: any, b: any) => a.rank - b.rank);

    return { 
        tournament: { id: tournamentSnap.id, name: tournamentData?.name },
        entries: leaderboard.map((entry: any, index: number) => ({ ...entry, id: entry.player || index.toString() })) as LeaderboardEntry[] // Use player name as temp id
    };
}

export default async function AdminTournamentLeaderboardPage({ params }: { params: { id: string }}) {
    const { tournament, entries, error } = await getTournamentLeaderboard(params.id);

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Server Configuration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!tournament) {
        notFound();
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Leaderboard</CardTitle>
                    <CardDescription>For tournament: {tournament.name}</CardDescription>
                </div>
                <Button asChild>
                    <Link href={`/admin/tournaments/${params.id}/leaderboard/add`}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Entry
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Matches</TableHead>
                            <TableHead>Chicken Dinners</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries && entries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium">{entry.rank}</TableCell>
                                <TableCell>{entry.player}</TableCell>
                                <TableCell>{entry.points}</TableCell>
                                <TableCell>{entry.matches}</TableCell>
                                <TableCell>{entry.chickenDinners}</TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${params.id}/leaderboard/edit/${entry.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteLeaderboardButton tournamentId={params.id} entryPlayerName={entry.player} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!entries || entries.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No entries found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
