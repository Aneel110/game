

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";
import DeleteLeaderboardButton from "./delete-leaderboard-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Timestamp } from "firebase-admin/firestore";
import GroupActions from "./group-actions";

type LeaderboardEntry = {
    id: string; 
    rank: number;
    teamName: string;
    logoUrl?: string;
    points: number;
    matches: number;
    kills: number;
    chickenDinners: number;
    group?: string;
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
    if (!tournamentData) return { tournament: null };

    // Sort by points descending for admin view
    const leaderboard = (tournamentData.leaderboard || []).sort((a: any, b: any) => b.points - a.points);
    
    const registrationsSnapshot = await tournamentRef.collection('registrations').where('status', '==', 'approved').get();
    const approvedCount = registrationsSnapshot.size;

    return { 
        tournament: { 
            id: tournamentSnap.id, 
            name: tournamentData.name, 
            groups: tournamentData.groups || {},
            groupsLastUpdated: tournamentData.groupsLastUpdated instanceof Timestamp ? tournamentData.groupsLastUpdated.toDate().toISOString() : null,
        },
        entries: leaderboard.map((entry: any, index: number) => ({ ...entry, id: entry.teamName || index.toString() })) as LeaderboardEntry[],
        approvedCount,
    };
}

function LeaderboardTable({ tournament, entries, title }: { tournament: any, entries: LeaderboardEntry[], title: string }) {
    if (entries.length === 0) return null;
    
    const groupName = title.startsWith('Group') ? title : 'Unassigned';

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary"/>
                {groupName} ({entries.length} teams)
            </h3>
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
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default async function AdminTournamentLeaderboardPage({ params }: { params: { id: string }}) {
    const { tournament, entries, error } = await getTournamentLeaderboard(params.id);

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
    
    const assignedGroups: { [key: string]: LeaderboardEntry[] } = {};
    const unassigned: LeaderboardEntry[] = [];
    const manualGroups = tournament.groups || {};

    entries.forEach(entry => {
        const groupName = manualGroups[entry.teamName];
        if (groupName) {
            if (!assignedGroups[groupName]) {
                assignedGroups[groupName] = [];
            }
            assignedGroups[groupName].push(entry);
        } else {
            unassigned.push(entry);
        }
    });
    
    // Sort groups alphabetically by name
    const sortedGroupNames = Object.keys(assignedGroups).sort((a,b) => a.localeCompare(b));


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Leaderboard</CardTitle>
                    <CardDescription>For tournament: {tournament.name}. Edit a team's group by hovering over the group name.</CardDescription>
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
               {entries.length === 0 ? (
                    <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                        No leaderboard entries found. Add entries to begin grouping teams.
                    </div>
               ) : (
                <>
                    {sortedGroupNames.map(groupName => (
                         <LeaderboardTable key={groupName} tournament={tournament} entries={assignedGroups[groupName]} title={`Group ${groupName}`} />
                    ))}
                    <LeaderboardTable tournament={tournament} entries={unassigned} title="Unassigned" />
                </>
               )}
            </CardContent>
        </Card>
    );
}

    
