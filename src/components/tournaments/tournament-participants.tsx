import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";


export default function TournamentParticipants({ participants, title, icon: Icon, showPlayers = true }: { participants: any[], title: string, icon: React.ElementType, showPlayers?: boolean }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Icon className="w-5 h-5 mr-3" />
            {title} ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length > 0 ? (
          participants.map(p => (
              <div key={p.id} className="flex items-start gap-3 flex-col">
                  <div>
                    <span className="font-medium">{p.teamName}</span>
                    <span className="text-sm text-muted-foreground ml-2">[{p.teamTag}]</span>
                  </div>
                  {showPlayers && Array.isArray(p.players) && p.players.length > 0 && (
                     <Accordion type="single" collapsible className="w-full mt-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-xs py-1 hover:no-underline">View Players ({p.players.length})</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-none space-y-2 pt-2">
                                    {p.players.map((player: any, index: number) => (
                                        <li key={index} className="flex items-center gap-2 text-xs">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <span className="font-semibold">{player.pubgName}</span> 
                                                <span className="text-muted-foreground"> ({player.pubgId})</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                  )}
              </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No teams in this category yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
