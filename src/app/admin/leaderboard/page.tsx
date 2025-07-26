

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import DeleteLeaderboardButton from "./delete-leaderboard-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LeaderboardEntry = {
    id: string;
    rank: number;
    player: string;
    points: number;
    matches: number;
    chickenDinners: number;
}

async function getLeaderboard() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." }
    }
    const snapshot = await db.collection('leaderboard').orderBy('rank', 'asc').get();
    return { 
        entries: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LeaderboardEntry[]
    };
}

export default async function AdminLeaderboardPage() {
    const { entries, error } = await getLeaderboard();

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Server Configuration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Leaderboard</CardTitle>
                <Button asChild>
                    <Link href="/admin/leaderboard/add">
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
                                        <Link href={`/admin/leaderboard/${entry.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteLeaderboardButton entryId={entry.id} />
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
