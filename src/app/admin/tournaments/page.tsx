import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { Eye, Badge } from "lucide-react";
import Link from "next/link";

async function getTournamentsWithRegistrationCounts() {
    const tournamentsSnapshot = await db.collection('tournaments').orderBy('date', 'desc').get();
    const tournaments = [];

    for (const doc of tournamentsSnapshot.docs) {
        const tournament = { id: doc.id, ...doc.data() };
        const registrationsSnapshot = await doc.ref.collection('registrations').where('status', '==', 'pending').get();
        tournaments.push({ ...tournament, pendingCount: registrationsSnapshot.size });
    }

    return tournaments;
}

export default async function AdminTournamentsPage() {
    const tournaments = await getTournamentsWithRegistrationCounts();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Tournaments</CardTitle>
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
                        {tournaments.map((t: any) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>{t.date}</TableCell>
                                <TableCell>{t.status}</TableCell>
                                <TableCell className="text-center font-bold text-primary">{t.pendingCount}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${t.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
