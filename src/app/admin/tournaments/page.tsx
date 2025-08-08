
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { Eye, Badge, PlusCircle, Edit, Trash2, AlertTriangle, BarChart } from "lucide-react";
import Link from "next/link";
import DeleteTournamentButton from "./delete-tournament-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function getTournamentStatus(date: string | Timestamp) {
    const now = new Date();
    const tournamentDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (tournamentDate > now) {
        return 'Upcoming';
    }
    return 'Finished';
}

async function getTournamentsWithRegistrationCounts() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." }
    }
    const tournamentsSnapshot = await db.collection('tournaments').orderBy('date', 'desc').get();
    const tournaments = [];

    for (const doc of tournamentsSnapshot.docs) {
        const tournamentData = doc.data();
        const tournament = { id: doc.id, ...tournamentData };
        // Correctly query the subcollection for pending registrations
        const registrationsSnapshot = await doc.ref.collection('registrations').where('status', '==', 'pending').get();
        tournaments.push({ ...tournament, pendingCount: registrationsSnapshot.size, status: getTournamentStatus(tournament.date) });
    }

    return { tournaments };
}

export default async function AdminTournamentsPage() {
    const { tournaments, error } = await getTournamentsWithRegistrationCounts();

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
                <CardTitle>Manage Tournaments</CardTitle>
                <Button asChild>
                    <Link href="/admin/tournaments/add">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Tournament
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Pending Registrations</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tournaments && tournaments.map((t: any) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>{t.date instanceof Timestamp ? t.date.toDate().toLocaleString() : new Date(t.date).toLocaleString()}</TableCell>
                                <TableCell>{t.status}</TableCell>
                                <TableCell className="text-center font-bold text-primary">{t.pendingCount}</TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${t.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                     <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${t.id}/leaderboard`}>
                                            <BarChart className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${t.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteTournamentButton tournamentId={t.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!tournaments || tournaments.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No tournaments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
