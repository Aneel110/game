
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Gamepad2, Trophy, ShieldCheck, ShieldAlert, BarChartHorizontal, Crown, Swords, Drumstick, Clock, Target, Gavel, Skull } from "lucide-react";
import TournamentRegistrationForm from "./registration-form";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import ParticipantsTable from "./participants-table";
import { Button } from "../ui/button";

function getTournamentStatus(tournamentDate: string): { status: 'Upcoming' | 'Past', color: string, registrationClosed: boolean, message: string } {
  const now = new Date();
  const date = new Date(tournamentDate);
  const registrationCutoff = new Date(date.getTime() - 6 * 60 * 60 * 1000); // 6 hours before

  if (now > date) {
      return { status: 'Past', color: 'bg-gray-500', registrationClosed: true, message: 'This tournament has finished.' };
  }
  if (now > registrationCutoff) {
      return { status: 'Upcoming', color: 'bg-blue-500', registrationClosed: true, message: 'Registration for this tournament has closed.' };
  }
  return { status: 'Upcoming', color: 'bg-blue-500', registrationClosed: false, message: '' };
};

export default function TournamentDetail({ tournament, registrations }: { tournament: any, registrations: any[] }) {
  const { user, loading } = useAuth();
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(tournament.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }));
  }, [tournament.date]);

  const { status, color, registrationClosed, message } = getTournamentStatus(tournament.date);
  
  const approvedParticipants = registrations.filter(r => r.status === 'approved');
  const pendingParticipants = registrations.filter(r => r.status === 'pending');
  const isAlreadyRegistered = user && registrations.some(r => r.registeredById === user.uid);
  const leaderboard = tournament.leaderboard?.sort((a: any, b: any) => a.rank - b.rank) || [];
  const rules = tournament.rules ? tournament.rules.split('\n') : [];

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
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image src={tournament.image} alt={tournament.name} layout="fill" objectFit="cover" data-ai-hint={tournament.dataAiHint} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 flex justify-between items-end w-full">
            <div>
                <Badge className={`text-white mb-2 ${color}`}>{status === 'Past' ? 'Finished' : 'Upcoming'}</Badge>
                <h1 className="text-5xl font-headline font-bold text-white shadow-lg">{tournament.name}</h1>
            </div>
             {!loading && status === 'Upcoming' && (
                <div>
                  {registrationClosed ? (
                     <Button size="lg" disabled>
                        <Clock className="w-4 h-4 mr-2" />
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
            <CardContent className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4 grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                   <div className="space-y-6">
                      <p className="text-muted-foreground">{tournament.description || "Detailed description of the tournament, including format, schedule, and other relevant information will be displayed here."}</p>
                      
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
                    {leaderboard.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="text-center">Kills</TableHead>
                                    <TableHead className="text-center">Wins</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((p: any) => (
                                    <TableRow key={p.rank}>
                                        <TableCell className="font-bold text-lg text-center">
                                            {p.rank === 1 ? <Crown className="w-6 h-6 text-yellow-400 inline-block" /> : p.rank}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-primary/50">
                                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${p.player.charAt(0)}`} />
                                                    <AvatarFallback>{p.player.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{p.player}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Skull className="w-4 h-4 text-muted-foreground" /> {p.kills}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Drumstick className="w-4 h-4 text-amber-500" /> {p.chickenDinners}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">{p.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <BarChartHorizontal className="w-12 h-12 mx-auto mb-2" />
                            <p>The leaderboard for this tournament is not yet available.</p>
                        </div>
                    )}
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
                            <Card className="p-4 flex items-center justify-between bg-card-darker">
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
                  <p className="font-bold">{formattedDate || 'Loading...'}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
