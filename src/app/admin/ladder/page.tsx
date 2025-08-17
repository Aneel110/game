
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { BarChart, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

async function getTournaments() {
    if (!db) {
        return { error: "Firebase Admin is not configured." }
    }
    const tournamentsSnapshot = await db.collection('tournaments').orderBy('date', 'desc').get();
    const tournaments = tournamentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        };
    });
    return { tournaments };
}

export default async function AdminLadderHubPage() {
    const { tournaments, error } = await getTournaments();

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
            <CardHeader>
                <CardTitle>Manage Tournament Ladders</CardTitle>
                <CardDescription>
                    Select a tournament to manage its competitive ladder. You can choose which approved teams are featured on the public ladder.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tournament Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tournaments && tournaments.map((t: any) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild>
                                        <Link href={`/admin/tournaments/${t.id}/ladder`}>
                                            <BarChart className="h-4 w-4 mr-2" />
                                            Manage Ladder
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!tournaments || tournaments.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No tournaments found. Create one to manage a ladder.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
