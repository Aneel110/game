

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RegistrationActions from "./registration-actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Mail, CheckCircle2, XCircle } from "lucide-react";
import { notFound, useParams } from 'next/navigation';
import { listAllUsersWithVerification, getTournamentRegistrations } from "@/lib/actions";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


type Registration = {
    id: string;
    registeredByName: string;
    teamName: string;
    teamTag: string;
    players: { pubgName: string; pubgId: string; discordUsername: string; }[];
    status: 'pending' | 'approved' | 'declined';
    registeredAt: string;
    userId: string;
}

type UserVerificationInfo = {
    emailVerified: boolean;
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

const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
        <Badge variant="outline" className="text-green-500 border-green-500">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Verified
        </Badge>
    ) : (
        <Badge variant="destructive">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Not Verified
        </Badge>
    )
}

function RegistrationsSkeleton() {
    return (
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
                {Array.from({ length: 3 }).map((_, i) => (
                     <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function AdminTournamentDetailPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const [tournament, setTournament] = useState<any>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [usersMap, setUsersMap] = useState<Map<string, UserVerificationInfo>>(new Map());
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            if (!db || !tournamentId) {
                setLoading(false);
                return;
            }

            // Fetch tournament data using client-side SDK
            const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
            if (!tournamentDoc.exists()) {
                notFound();
                return;
            }
            setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });

            // Fetch registrations via server action
            const { data, success } = await getTournamentRegistrations(tournamentId);
            if (success) {
                setRegistrations(data);
            }

            // Fetch all users with verification status via server action
            const { users, error } = await listAllUsersWithVerification();
            if (!error && users) {
                const userVerificationMap = new Map(users.map(u => [u.id, { emailVerified: u.emailVerified }]));
                setUsersMap(userVerificationMap);
            }
            
            setLoading(false);
        }

        if (tournamentId) {
          fetchData();
        }
    }, [tournamentId]);
    
    if (loading || !tournament) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-8 w-1/2" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <RegistrationsSkeleton />
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrations for: {tournament.name}</CardTitle>
                <CardDescription>
                    Review and manage team registrations for this tournament. Approving a team will automatically add them to the leaderboard.
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
                        {registrations.map((reg: Registration) => (
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
                                    <div className="text-xs mt-1">
                                        {usersMap.has(reg.userId) && getVerificationBadge(usersMap.get(reg.userId)!.emailVerified)}
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(reg.status)}</TableCell>
                                <TableCell className="text-right">
                                   {reg.status !== 'declined' && <RegistrationActions tournamentId={tournamentId} registrationId={reg.id} currentStatus={reg.status} teamName={reg.teamName} />}
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
