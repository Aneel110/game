import { getTournamentRegistrations } from "@/lib/actions";
import { db } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RegistrationActions from "./registration-actions";

type AdminTournamentDetailPageProps = {
    params: {
        id: string;
    }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'pending':
            return <Badge variant="outline" className="text-yellow-400 border-yellow-400">Pending</Badge>;
        case 'approved':
            return <Badge variant="outline" className="text-green-400 border-green-400">Approved</Badge>;
        case 'declined':
            return <Badge variant="outline" className="text-red-400 border-red-400">Declined</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

async function getTournamentData(id: string) {
    const docRef = db.collection("tournaments").doc(id);
    const docSnap = await docRef.get();
    return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
}

export default async function AdminTournamentDetailPage({ params }: AdminTournamentDetailPageProps) {
    const tournament = await getTournamentData(params.id);
    const { success, data: registrations } = await getTournamentRegistrations(params.id);

    if (!tournament) {
        return <div>Tournament not found.</div>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrations for: {tournament.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Registered At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registrations.map((reg: any) => (
                             <TableRow key={reg.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={reg.userAvatar} />
                                            <AvatarFallback>{reg.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{reg.userName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {new Date(reg.registeredAt._seconds * 1000).toLocaleString()}
                                </TableCell>
                                <TableCell>{getStatusBadge(reg.status)}</TableCell>
                                <TableCell className="text-right">
                                   {reg.status === 'pending' && <RegistrationActions tournamentId={params.id} registrationId={reg.id} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
