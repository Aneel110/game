
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import DeleteLeaderboardButton from "./delete-leaderboard-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deterministicShuffle } from "@/lib/utils";
import { Timestamp } from "firebase-admin/firestore";
import GroupActions from "./group-actions";

type LeaderboardEntry = {
    id: string; // This will be the team's name for simplicity if we don't have unique IDs per entry
    rank: number;
    teamName: string;
    logoUrl?: string;
    points: number;
    matches: number;
    kills: number;
    chickenDinners: number;
    group?: 'A' | 'B';
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

    // Sort by points descending for admin view
    const leaderboard = (tournamentData?.leaderboard || []).sort((a: any, b: any) => b.points - a.points);
    
    const registrationsSnapshot = await tournamentRef.collection('registrations').where('status', '==', 'approved').get();
    const approvedCount = registrationsSnapshot.size;

    return { 
        tournament: { 
            id: tournamentSnap.id, 
            name: tournamentData?.name, 
            groups: tournamentData?.groups || {},
            groupsLastUpdated: tournamentData?.groupsLastUpdated instanceof Timestamp ? tournamentData.groupsLastUpdated.toDate().toISOString() : null,
        },
        entries: leaderboard.map((entry: any, index: number) => ({ ...entry, id: entry.teamName || index.toString() })) as LeaderboardEntry[],
        approvedCount,
    };
}

function LeaderboardTable({ tournament, entries, title }: { tournament: any, entries: LeaderboardEntry[], title: string }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">{title} ({entries.length} teams)</h3>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Matches</TableHead>
                            <TableHead>Kills</TableHead>
                            <TableHead>Chicken Dinners</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries && entries.map((entry, index) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={entry.logoUrl || `https://placehold.co/40x40.png?text=${entry.teamName.charAt(0)}`} alt={entry.teamName} />
                                        <AvatarFallback>{entry.teamName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{entry.teamName}</TableCell>
                                <TableCell>
                                    <GroupActions tournamentId={tournament.id} teamName={entry.teamName} currentGroup={tournament.groups?.[entry.teamName]} />
                                </TableCell>
                                <TableCell>{entry.points}</TableCell>
                                <TableCell>{entry.matches}</TableCell>
                                <TableCell>{entry.kills}</TableCell>
                                <TableCell>{entry.chickenDinners}</TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/tournaments/${tournament.id}/leaderboard/edit/${encodeURIComponent(entry.teamName)}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteLeaderboardButton tournamentId={tournament.id} entryTeamName={entry.teamName} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!entries || entries.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No entries found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default async function AdminTournamentLeaderboardPage({ params }: { params: { id: string }}) {
    const { tournament, entries, approvedCount, error } = await getTournamentLeaderboard(params.id);

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
    
    const showGroups = approvedCount > 25;
    const manualGroups = tournament.groups || {};
    
    let groupA: LeaderboardEntry[] = [];
    let groupB: LeaderboardEntry[] = [];

    if (showGroups) {
        const unassignedTeams = entries.filter(e => !manualGroups[e.teamName]);
        const shuffledUnassigned = deterministicShuffle(unassignedTeams, tournament.id);

        for (const team of entries) {
            const assignedGroup = manualGroups[team.teamName];
            if (assignedGroup === 'A') {
                groupA.push(team);
            } else if (assignedGroup === 'B') {
                groupB.push(team);
            }
        }
        
        for (const team of shuffledUnassigned) {
             if (groupA.length <= groupB.length) {
                groupA.push(team);
            } else {
                groupB.push(team);
            }
        }

    } else {
        groupA = entries;
    }


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Leaderboard</CardTitle>
                    <CardDescription>For tournament: {tournament.name}</CardDescription>
                     {tournament.groupsLastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">Groups last updated: {new Date(tournament.groupsLastUpdated).toLocaleString()}</p>
                    )}
                </div>
                <Button asChild>
                    <Link href={`/admin/tournaments/${params.id}/leaderboard/add`}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Entry
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-8">
               {showGroups ? (
                   <>
                    <LeaderboardTable tournament={tournament} entries={groupA} title="Group A" />
                    <LeaderboardTable tournament={tournament} entries={groupB} title="Group B" />
                   </>
               ) : (
                    <LeaderboardTable tournament={tournament} entries={entries} title="Overall Leaderboard" />
               )}
            </CardContent>
        </Card>
    );
}

    