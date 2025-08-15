
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { PlusCircle, Edit, Users, Bot } from "lucide-react";
import Link from "next/link";
import DeleteLeaderboardButton from "./delete-leaderboard-button";
import { useParams, notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GroupActions from "./group-actions";
import { useEffect, useState, useMemo } from "react";
import { doc, onSnapshot, collection, Unsubscribe, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { manageTournamentGroups } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

type TournamentData = {
    id: string;
    name: string;
    leaderboard?: any[];
    groups?: { [key: string]: string };
    groupsInitialized?: boolean;
    groupsLastUpdated?: { toDate: () => Date };
}

type RegistrationData = {
    id: string;
    teamName: string;
}

type CombinedTeamEntry = {
    id: string; // This will be the registration doc ID or team name if no registration exists
    teamName: string;
    logoUrl?: string;
    points?: number;
    matches?: number;
    kills?: number;
    chickenDinners?: number;
    group?: string;
}

function LeaderboardSkeleton() {
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
                            {Array.from({length: 7}).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({length: 7}).map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


function LeaderboardTable({ tournament, entries, title }: { tournament: TournamentData, entries: CombinedTeamEntry[], title: string }) {
    if (entries.length === 0) return null;
    
    // Sort entries by team name alphabetically
    const sortedEntries = useMemo(() => {
        return [...entries].sort((a, b) => a.teamName.localeCompare(b.teamName));
    }, [entries]);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary"/>
                {title} ({entries.length} teams)
            </h3>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead className="text-center">Points</TableHead>
                            <TableHead className="text-center">Matches</TableHead>
                            <TableHead className="text-center">Kills</TableHead>
                            <TableHead className="text-center">Wins</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedEntries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={entry.logoUrl || `https://placehold.co/40x40.png?text=${entry.teamName.charAt(0)}`} alt={entry.teamName} />
                                            <AvatarFallback>{entry.teamName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{entry.teamName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <GroupActions tournamentId={tournament.id} teamName={entry.teamName} currentGroup={entry.group} />
                                </TableCell>
                                <TableCell className="text-center">{entry.points ?? 0}</TableCell>
                                <TableCell className="text-center">{entry.matches ?? 0}</TableCell>
                                <TableCell className="text-center">{entry.kills ?? 0}</TableCell>
                                <TableCell className="text-center">{entry.chickenDinners ?? 0}</TableCell>
                                <TableCell className="text-right flex gap-1 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${tournament.id}/leaderboard/edit/${encodeURIComponent(entry.teamName)}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteLeaderboardButton tournamentId={tournament.id} entryTeamName={entry.teamName} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default function AdminTournamentLeaderboardPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const { toast } = useToast();
    const [tournament, setTournament] = useState<TournamentData | null>(null);
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isManagingGroups, setIsManagingGroups] = useState(false);

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
            setLoading(false);
        });

        const regsRef = collection(db, 'tournaments', tournamentId, 'registrations');
        const q = query(regsRef, where('status', '==', 'approved'));

        const unsubscribeRegs = onSnapshot(q, (querySnapshot) => {
            const approvedRegs = querySnapshot.docs
                .map(d => ({ id: d.id, teamName: d.data().teamName }));
            setRegistrations(approvedRegs);
        });

        return () => {
            unsubscribeTournament();
            unsubscribeRegs();
        };

    }, [tournamentId]);

    const handleManageGroups = async (reset = false) => {
        if (!tournamentId) return;
        setIsManagingGroups(true);
        const result = await manageTournamentGroups(tournamentId, reset);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsManagingGroups(false);
    };

    const combinedTeams = useMemo(() => {
        if (!tournament) return [];
        
        const allTeamsMap = new Map<string, CombinedTeamEntry>();
        const leaderboard = tournament.leaderboard || [];
        const groups = tournament.groups || {};

        // Add all approved teams first to ensure they are on the list
        registrations.forEach(reg => {
            allTeamsMap.set(reg.teamName, {
                id: reg.id,
                teamName: reg.teamName,
                group: groups[reg.teamName],
                points: 0,
                matches: 0,
                kills: 0,
                chickenDinners: 0,
            });
        });

        // Merge leaderboard data into the map, overwriting defaults
        leaderboard.forEach((entry: any) => {
            const existingTeam = allTeamsMap.get(entry.teamName);
            allTeamsMap.set(entry.teamName, {
                id: existingTeam?.id || entry.teamName, // Use registration ID if available
                teamName: entry.teamName,
                group: groups[entry.teamName],
                logoUrl: entry.logoUrl,
                points: entry.points,
                matches: entry.matches,
                kills: entry.kills,
                chickenDinners: entry.chickenDinners,
            });
        });

        return Array.from(allTeamsMap.values());
    }, [tournament, registrations]);

    const groupedTeams = useMemo(() => {
        const groups: { [key: string]: CombinedTeamEntry[] } = {};
        combinedTeams.forEach(team => {
            const groupName = team.group || 'Unassigned';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(team);
        });
        return groups;
    }, [combinedTeams]);

    if (loading) {
        return <LeaderboardSkeleton />;
    }

    if (!tournament) {
        return notFound();
    }

    const sortedGroupNames = Object.keys(groupedTeams).sort((a,b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b)
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Manage Leaderboard & Groups</CardTitle>
                    <CardDescription>For tournament: {tournament.name}. Real-time updates are active.</CardDescription>
                     {tournament.groupsLastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">Groups last updated: {tournament.groupsLastUpdated.toDate().toLocaleString()}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleManageGroups()} disabled={isManagingGroups || registrations.length === 0}>
                        <Bot className="mr-2 h-4 w-4" />
                        {isManagingGroups ? 'Processing...' : 'Auto-Manage Groups'}
                    </Button>
                    <Button asChild>
                        <Link href={`/admin/tournaments/${tournamentId}/leaderboard/add`}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Entry
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
               {combinedTeams.length === 0 ? (
                    <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                        No approved teams found. Approve registrations to begin managing the leaderboard.
                    </div>
               ) : (
                <>
                    {sortedGroupNames.map(groupName => (
                         <LeaderboardTable key={groupName} tournament={tournament} entries={groupedTeams[groupName]} title={groupName === 'Unassigned' ? 'Unassigned Teams' : `Group ${groupName}`} />
                    ))}
                </>
               )}
            </CardContent>
        </Card>
    );
}
