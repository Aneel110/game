
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, Unsubscribe, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateLadderSelection } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TournamentData = {
    id: string;
    name: string;
}

type TeamData = {
    id: string;
    teamName: string;
    selected: boolean;
    logoUrl?: string;
}

function LadderManagementSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function TeamSelectionRow({ tournamentId, team }: { tournamentId: string, team: TeamData }) {
    const { toast } = useToast();
    const [isSelected, setIsSelected] = useState(team.selected);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true);
        setIsSelected(checked); // Optimistic update
        const result = await updateLadderSelection(tournamentId, team.id, checked);
        if (!result.success) {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
            setIsSelected(!checked); // Revert on failure
        }
        setIsLoading(false);
    }

    return (
         <TableRow key={team.id}>
            <TableCell>
                 <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={team.logoUrl || `https://placehold.co/40x40.png?text=${team.teamName.charAt(0)}`} alt={team.teamName} />
                        <AvatarFallback>{team.teamName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{team.teamName}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                    <Label htmlFor={`select-${team.id}`} className="text-muted-foreground">Show on Ladder</Label>
                    <Switch
                        id={`select-${team.id}`}
                        checked={isSelected}
                        onCheckedChange={handleToggle}
                        disabled={isLoading}
                        aria-label={`Select ${team.teamName} for ladder`}
                    />
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function AdminTournamentLadderPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const [tournament, setTournament] = useState<TournamentData | null>(null);
    const [approvedTeams, setApprovedTeams] = useState<TeamData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tournamentId || !db) {
            setLoading(false);
            return;
        }

        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const unsubscribeTournament = onSnapshot(tournamentRef, (docSnap) => {
            if (docSnap.exists()) {
                setTournament({ id: docSnap.id, ...docSnap.data() } as TournamentData);
            } else {
                setTournament(null); // Or trigger notFound()
            }
        });

        const regsRef = collection(db, 'tournaments', tournamentId, 'registrations');
        const q = query(regsRef, where('status', '==', 'approved'));

        const unsubscribeRegs = onSnapshot(q, (querySnapshot) => {
            const teams = querySnapshot.docs
                .map(d => {
                    const data = d.data();
                    return { 
                        id: d.id, 
                        teamName: data.teamName, 
                        selected: data.selected || false, // Default to false if not set
                        logoUrl: data.logoUrl
                    }
                });
            setApprovedTeams(teams);
             if (loading) setLoading(false);
        });

        return () => {
            unsubscribeTournament();
            unsubscribeRegs();
        };

    }, [tournamentId, loading]);


    if (loading) {
        return <LadderManagementSkeleton />;
    }

    if (!tournament) {
        return notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Ladder for: {tournament.name}</CardTitle>
                <CardDescription>
                    Select the approved teams you want to feature on the public tournament ladder.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead className="text-right">Selection</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvedTeams.length > 0 ? (
                            approvedTeams.map((team) => (
                               <TeamSelectionRow key={team.id} tournamentId={tournamentId} team={team} />
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    No approved teams for this tournament yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

