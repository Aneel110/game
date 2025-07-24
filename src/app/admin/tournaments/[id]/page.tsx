
import { db } from "@/lib/firebase-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RegistrationActions from "./registration-actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Mail } from "lucide-react";

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

async function getSerializableRegistrations(tournamentId: string) {
    const registrationsSnapshot = await db.collection('tournaments').doc(tournamentId).collection('registrations').get();
    const registrations = registrationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            registeredAt: data.registeredAt.toDate().toISOString(),
        };
    });
    return registrations;
}

export default async function AdminTournamentDetailPage({ params }: AdminTournamentDetailPageProps) {
    const tournament = await getTournamentData(params.id);
    const registrations = await getSerializableRegistrations(params.id);

    if (!tournament) {
        return <div>Tournament not found.</div>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrations for: {tournament.name}</CardTitle>
                <CardDescription>
                    Review and manage team registrations for this tournament.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Registered By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registrations.map((reg: any) => (
                             <TableRow key={reg.id}>
                                <TableCell>
                                    <div className="font-medium">{reg.teamName}</div>
                                    <div className="text-sm text-muted-foreground">[{reg.teamTag}]</div>
                                     <Accordion type="single" collapsible className="w-full mt-2">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="text-xs py-1">View Players ({Array.isArray(reg.players) ? reg.players.length : 0})</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-none space-y-2 pt-2">
                                                    {Array.isArray(reg.players) && reg.players.map((player: any, index: number) => (
                                                        <li key={index} className="flex flex-col items-start gap-1 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-3 h-3 text-muted-foreground" />
                                                                <div>
                                                                    <span className="font-semibold">{player.pubgName}</span> 
                                                                    <span className="text-muted-foreground"> ({player.pubgId})</span>
                                                                </div>
                                                            </div>
                                                            {player.discordUsername && (
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 ml-5">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-code"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="m10 10-2 2 2 2"/><path d="m14 10 2 2-2 2"/></svg>
                                                                    {player.discordUsername}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{reg.registeredByName}</div>
                                </TableCell>
                                <TableCell>{getStatusBadge(reg.status)}</TableCell>
                                <TableCell className="text-right">
                                   {reg.status === 'pending' && <RegistrationActions tournamentId={params.id} registrationId={reg.id} />}
                                </TableCell>
                            </TableRow>
                        ))}
                         {registrations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No registrations yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
