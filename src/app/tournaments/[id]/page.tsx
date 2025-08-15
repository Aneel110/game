
'use client';

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Gamepad2, Trophy, ShieldCheck, ShieldAlert, BarChartHorizontal, Crown, Swords, Drumstick, Clock, Target, Gavel, Skull, Lock, Users } from "lucide-react";
import TournamentRegistrationForm from "@/components/tournaments/registration-form";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ParticipantsTable from "@/components/tournaments/participants-table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, Unsubscribe, query, where } from "firebase/firestore";
import { useParams, notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type Tournament = {
    id: string;
    name: string;
    description?: string;
    date: string;
    image: string;
    dataAiHint?: string;
    mode?: string;
    rules?: string;
    prizeDistribution?: any;
    leaderboard?: any[];
    finalistLeaderboard?: any[];
    finalistLeaderboardActive?: boolean;
    groups?: { [key: string]: string };
    registrationOpen?: boolean;
};

type Registration = {
    id: string;
    status: 'approved' | 'pending' | 'declined';
    teamName: string;
    teamTag: string;
    [key: string]: any;
};

function PageSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-80 md:h-96 rounded-lg mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-10 w-1/3 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>
    );
}

function getTournamentStatus(tournamentDate: string, manualRegistrationOpen: boolean): { status: 'Upcoming' | 'Past', color: string, registrationClosed: boolean, message: string } {
  const now = new Date();
  const date = new Date(tournamentDate);
  const registrationCutoff = new Date(date.getTime() - 6 * 60 * 60 * 1000); // 6 hours before

  if (now > date) {
      return { status: 'Past', color: 'bg-gray-500', registrationClosed: true, message: 'This tournament has finished.' };
  }
  
  if (!manualRegistrationOpen) {
      return { status: 'Upcoming', color: 'bg-blue-500', registrationClosed: true, message: 'Registration for this tournament is currently closed by the admin.' };
  }

  if (now > registrationCutoff) {
      return { status: 'Upcoming', color: 'bg-blue-500', registrationClosed: true, message: 'Registration for this tournament has closed as the start time is approaching.' };
  }
  
  return { status: 'Upcoming', color: 'bg-blue-500', registrationClosed: false, message: '' };
};

function LeaderboardTable({ title, leaderboardData, icon: Icon }: { title: string, leaderboardData: any[], icon?: React.ElementType }) {
    const sortedLeaderboard = [...leaderboardData].sort((a,b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.chickenDinners !== a.chickenDinners) return b.chickenDinners - a.chickenDinners;
        return b.kills - a.kills;
    });
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-headline font-semibold flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5" />}
                {title} ({leaderboardData.length} teams)
            </h3>
            <Card>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">Rank</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead className="text-center">Matches</TableHead>
                                <TableHead className="text-center">Wins</TableHead>
                                <TableHead className="text-center">Kills</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedLeaderboard.length > 0 ? sortedLeaderboard.map((p: any, index: number) => {
                                const rank = index + 1;
                                return (
                                <TableRow key={p.teamName}>
                                    <TableCell className="font-bold text-md text-center">
                                        {rank === 1 ? <Crown className="w-5 h-5 text-yellow-400 inline-block" /> : rank}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border-2 border-primary/50">
                                                <AvatarImage src={p.logoUrl || `https://placehold.co/40x40.png?text=${p.teamName.charAt(0)}`} />
                                                <AvatarFallback>{p.teamName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm md:text-base">{p.teamName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-sm md:text-base">
                                        <div className="flex items-center justify-center gap-1 md:gap-2">
                                            <Swords className="w-3.5 h-3.5 text-muted-foreground" /> {p.matches || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-sm md:text-base">
                                        <div className="flex items-center justify-center gap-1 md:gap-2">
                                            <Drumstick className="w-3.5 h-3.5 text-amber-500" /> {p.chickenDinners || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-sm md:text-base">
                                        <div className="flex items-center justify-center gap-1 md:gap-2">
                                            <Skull className="w-3.5 h-3.5 text-muted-foreground" /> {p.kills || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">{p.points}</TableCell>
                                </TableRow>
                            )}) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No teams on the leaderboard yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

export default function TournamentDetailPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const { user, loading: authLoading } = useAuth();
    
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tournamentId || !db) return;

        const unsubTournament = onSnapshot(doc(db, "tournaments", tournamentId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const tournamentData = {
                    ...data,
                    id: docSnap.id,
                    date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
                } as Tournament;
                setTournament(tournamentData);
            } else {
                setTournament(null);
            }
            setLoading(false);
        });

        const regsCollectionRef = collection(db, "tournaments", tournamentId, "registrations");
        const unsubRegistrations = onSnapshot(regsCollectionRef, (snapshot) => {
            const regs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Registration));
            setRegistrations(regs);
        });
        
        return () => {
            unsubTournament();
            unsubRegistrations();
        };

    }, [tournamentId]);

    const formattedDate = tournament?.date ? new Date(tournament.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) : 'Loading...';
    
    const approvedParticipants = useMemo(() => registrations.filter(r => r.status === 'approved'), [registrations]);
    const pendingParticipants = useMemo(() => registrations.filter(r => r.status === 'pending'), [registrations]);
    const isAlreadyRegistered = user && registrations.some(r => r.id === user.uid);
    const rules = tournament?.rules ? tournament.rules.split('\n') : [];

    const leaderboard = useMemo(() => tournament?.leaderboard || [], [tournament?.leaderboard]);
    const finalistLeaderboard = useMemo(() => tournament?.finalistLeaderboard || [], [tournament?.finalistLeaderboard]);
    const finalistLeaderboardActive = tournament?.finalistLeaderboardActive || false;
    
    const groupedTeams = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        const leaderboardTeams = tournament?.leaderboard || [];
        const groupAssignments = tournament?.groups || {};

        leaderboardTeams.forEach(team => {
            const groupName = groupAssignments[team.teamName] || 'Unassigned';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(team);
        });
        return groups;
    }, [tournament?.leaderboard, tournament?.groups]);

    const sortedGroupNames = Object.keys(groupedTeams).sort((a,b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });

    if (loading || authLoading) {
        return <PageSkeleton />;
    }

    if (!tournament) {
        return notFound();
    }

    const manualRegistrationOpen = tournament.registrationOpen !== false;
    const { status, color, registrationClosed, message } = getTournamentStatus(tournament.date, manualRegistrationOpen);
    
    const prizeDistribution = tournament.prizeDistribution || {};
    const totalPrize = Object.values(prizeDistribution).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0);

    const prizeItems = [
        { label: "1st Place", value: prizeDistribution.first },
        { label: "2nd Place", value: prizeDistribution.second },
        { label: "3rd Place", value: prizeDistribution.third },
        { label: "4th Place", value: prizeDistribution.fourth },
        { label: "5th Place", value: prizeDistribution.fifth },
    ].filter(p => p.value > 0);

    const topKillsPrize = prizeDistribution.topKills;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden mb-8">
                <Image src={tournament.image} alt={tournament.name} fill objectFit="cover" data-ai-hint={tournament.dataAiHint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full h-full gap-4">
                    <div className="space-y-2">
                        <Badge className={`text-white ${color}`}>{status === 'Past' ? 'Finished' : 'Upcoming'}</Badge>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white text-shadow-lg">{tournament.name}</h1>
                    </div>
                    {status === 'Upcoming' && (
                        <div className="shrink-0">
                        {registrationClosed ? (
                            <Button size="lg" disabled title={message}>
                                <Lock className="w-4 h-4 mr-2" />
                                Registration Closed
                            </Button>
                        ) : (
                            <TournamentRegistrationForm 
                            tournamentId={tournament.id}
                            isLoggedIn={!!user}
                            isAlreadyRegistered={!!isAlreadyRegistered}
                            />
                        )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                <Card>
                    <CardContent className="p-4 md:p-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="overflow-x-auto">
                            <TabsList className="mb-4 grid-flow-col">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                                <TabsTrigger value="rules">Rules</TabsTrigger>
                                <TabsTrigger value="prizes">Prizes</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="overview">
                        <div className="space-y-6">
                            <p className="text-muted-foreground">{tournament.description || "Detailed description will be displayed here."}</p>
                            <Separator />
                            <div className="space-y-4">
                                <ParticipantsTable 
                                    icon={ShieldCheck}
                                    title="Approved Teams"
                                    participants={approvedParticipants}
                                />
                                <ParticipantsTable 
                                    icon={ShieldAlert}
                                    title="Pending Approval"
                                    participants={pendingParticipants}
                                />
                            </div>
                        </div>
                        </TabsContent>
                        <TabsContent value="leaderboard">
                            <div className="space-y-8">
                                {Object.keys(groupedTeams).length > 0 ? (
                                    sortedGroupNames.map(groupName => (
                                        <LeaderboardTable key={groupName} title={groupName === 'Unassigned' ? 'Unassigned Teams' : `Group ${groupName}`} leaderboardData={groupedTeams[groupName]} icon={Users} />
                                    ))
                                ) : (
                                    leaderboard.length > 0 ? (
                                        <LeaderboardTable title="Leaderboard" leaderboardData={leaderboard} />
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <BarChartHorizontal className="w-12 h-12 mx-auto mb-2" />
                                            <p>The leaderboard is not yet available.</p>
                                        </div>
                                    )
                                )}
                                {finalistLeaderboardActive && finalistLeaderboard.length > 0 && (
                                    <>
                                        <Separator />
                                        <LeaderboardTable title="Finals" leaderboardData={finalistLeaderboard} icon={Crown} />
                                    </>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="rules">
                            {rules.length > 0 ? (
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                {rules.map((rule: string, index: number) => (
                                    <li key={index}>{rule}</li>
                                ))}
                                </ul>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <Gavel className="w-12 h-12 mx-auto mb-2" />
                                    <p>Tournament rules are not yet available.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="prizes">
                        <div className="space-y-4">
                                {prizeItems.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {prizeItems.map((item) => (
                                            <Card key={item.label} className="p-4 text-center">
                                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                                <p className="text-xl font-bold text-primary">Rs {item.value.toLocaleString()}</p>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center">Prize distribution is not yet announced.</p>
                                )}
                                {topKillsPrize > 0 && (
                                <>
                                    <Separator />
                                    <Card className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Target className="w-6 h-6 text-destructive" />
                                            <p className="font-semibold text-lg">Top Kills</p>
                                        </div>
                                        <p className="text-xl font-bold text-destructive">Rs {topKillsPrize.toLocaleString()}</p>
                                    </Card>
                                </>
                                )}
                        </div>
                        </TabsContent>
                    </Tabs>
                    </CardContent>
                </Card>
                </div>
                <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <Trophy className="w-5 h-5 mr-3 text-primary" />
                        <div>
                        <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                        <p className="font-bold text-lg">Rs {totalPrize.toLocaleString()}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-primary" />
                        <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-bold">{formattedDate}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center">
                        <Gamepad2 className="w-5 h-5 mr-3 text-primary" />
                        <div>
                        <p className="text-sm text-muted-foreground">Game Mode</p>
                        <p className="font-bold">{tournament.mode || 'Squads'}</p>
                        </div>
                    </div>
                    {registrationClosed && status === 'Upcoming' && (
                        <>
                        <Separator />
                        <div className="flex items-start">
                        <Clock className="w-5 h-5 mr-3 text-yellow-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Registration Update</p>
                            <p className="font-bold text-yellow-400">{message}</p>
                        </div>
                        </div>
                        </>
                    )}
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    );
}
