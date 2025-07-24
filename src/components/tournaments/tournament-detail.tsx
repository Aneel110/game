import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Gamepad2, Trophy, Users } from "lucide-react";
import TournamentParticipants from "./tournament-participants";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Upcoming':
      return 'bg-blue-500';
    case 'Ongoing':
      return 'bg-green-500';
    case 'Finished':
      return 'bg-gray-500';
    default:
      return 'bg-secondary';
  }
};

export default function TournamentDetail({ tournament }: { tournament: any }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image src={tournament.image} alt={tournament.name} layout="fill" objectFit="cover" data-ai-hint={tournament.dataAiHint} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <Badge className={`text-white mb-2 ${getStatusColor(tournament.status)}`}>{tournament.status}</Badge>
          <h1 className="text-5xl font-headline font-bold text-white shadow-lg">{tournament.name}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <p className="text-muted-foreground">{tournament.description || "Detailed description of the tournament, including format, schedule, and other relevant information will be displayed here."}</p>
                </TabsContent>
                <TabsContent value="rules">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Be respectful to all players and staff.</li>
                    <li>No cheating, scripting, or exploiting bugs.</li>
                    <li>Admins have the final say in all disputes.</li>
                    <li>Check-in is required 30 minutes before the tournament starts.</li>
                  </ul>
                </TabsContent>
                <TabsContent value="prizes">
                   <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>1st Place: ${ (tournament.prize * 0.5).toLocaleString() }</li>
                    <li>2nd Place: ${ (tournament.prize * 0.3).toLocaleString() }</li>
                    <li>3rd Place: ${ (tournament.prize * 0.15).toLocaleString() }</li>
                    <li>4th Place: ${ (tournament.prize * 0.05).toLocaleString() }</li>
                  </ul>
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
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="font-bold text-lg">${parseInt(tournament.prize).toLocaleString()}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold">{tournament.date}</p>
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
          <TournamentParticipants participants={tournament.participants} />
        </div>
      </div>
    </div>
  );
}
