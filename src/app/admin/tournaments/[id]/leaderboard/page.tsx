

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
    if (!tournamentData) {
        return { tournament: { id: tournamentSnap.id, name: "Unknown" }, entries: [], groups: {} };
    }

    const groups: Record<string, 'A' | 'B'> = tournamentData.groups || {};
    let groupsUpdated = false;

    // Sort by points descending for admin view
    const leaderboard = (tournamentData.leaderboard || []).sort((a: any, b: any) => b.points - a.points);
    
    // Assign groups if they don't exist
    if (leaderboard.length > 25) {
        const shuffledTeams = deterministicShuffle(leaderboard);
        const groupACount = Math.ceil(shuffledTeams.length / 2);

        shuffledTeams.forEach((team, index) => {
            if (!groups[team.teamName]) {
                groups[team.teamName] = index < groupACount ? 'A' : 'B';
                groupsUpdated = true;
            }
        });
    }

    if (groupsUpdated && db) {
        await tournamentRef.update({
            groups,
            groupsLastUpdated: Timestamp.now()
        });
    }

    const entriesWithGroups = leaderboard.map((entry: any, index: number) => ({ 
        ...entry, 
        id: entry.teamName || index.toString(),
        group: groups[entry.teamName],
    })) as LeaderboardEntry[];


    return { 
        tournament: { 
            id: tournamentSnap.id, 
            name: tournamentData.name,
            groupsLastUpdated: tournamentData.groupsLastUpdated 
                ? (tournamentData.groupsLastUpdated as Timestamp).toDate().toISOString() 
                : null
        },
        entries: entriesWithGroups,
        groups: groups,
    };
}


function LeaderboardTable({ title, entries, tournamentId }: { title: string, entries: LeaderboardEntry[], tournamentId: string }) {
    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">{title} ({entries.length} teams)</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Matches</TableHead>
                        <TableHead>Kills</TableHead>
                        <TableHead>Wins</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries && entries.map((entry, index) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={entry.logoUrl || `https://placehold.co/40x40.png?text=${entry.teamName.charAt(0)}`} alt={entry.teamName} />
                                        <AvatarFallback>{entry.teamName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{entry.teamName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{entry.points}</TableCell>
                            <TableCell>{entry.matches}</TableCell>
                            <TableCell>{entry.kills}</TableCell>
                            <TableCell>{entry.chickenDinners}</TableCell>
                             <TableCell>
                                <GroupActions 
                                    tournamentId={tournamentId} 
                                    teamName={entry.teamName} 
                                    currentGroup={entry.group || 'A'} 
                                />
                            </TableCell>
                            <TableCell className="text-right flex gap-2 justify-end">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={`/admin/tournaments/${tournamentId}/leaderboard/edit/${encodeURIComponent(entry.teamName)}`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <DeleteLeaderboardButton tournamentId={tournamentId} entryTeamName={entry.teamName} />
                            </TableCell>
                        </TableRow>
                    ))}
                     {(!entries || entries.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                No entries found for this group.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
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
    
    const showGroups = entries.length > 25;
    const groupA = showGroups ? entries.filter(e => e.group === 'A') : [];
    const groupB = showGroups ? entries.filter(e => e.group === 'B') : [];


    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Manage Leaderboard</CardTitle>
                    <CardDescription>
                        For tournament: {tournament.name}
                        {showGroups && tournament.groupsLastUpdated && (
                            <span className="text-xs block text-muted-foreground mt-1">
                                Groups last updated automatically at: {new Date(tournament.groupsLastUpdated).toLocaleString()}
                            </span>
                        )}
                    </CardDescription>
                </div>
                <Button asChild>
                    <Link href={`/admin/tournaments/${params.id}/leaderboard/add`}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Entry
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {showGroups ? (
                    <>
                        <LeaderboardTable title="Group A" entries={groupA} tournamentId={params.id} />
                        <LeaderboardTable title="Group B" entries={groupB} tournamentId={params.id} />
                    </>
                ) : (
                    <LeaderboardTable title="Leaderboard" entries={entries} tournamentId={params.id} />
                )}
            </CardContent>
        </Card>
    );
}

    