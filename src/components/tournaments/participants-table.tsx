
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { User, Users } from "lucide-react";


interface ParticipantsTableProps {
    participants: any[];
    title: string;
    icon: React.ElementType;
}

export default function ParticipantsTable({ participants, title, icon: Icon }: ParticipantsTableProps) {
    return (
        <div>
            <h3 className="text-xl font-headline font-semibold mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {title} ({participants.length})
            </h3>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Captain</TableHead>
                            <TableHead className="text-right">Players</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length > 0 ? (
                            participants.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="font-medium">{p.teamName}</div>
                                        <div className="text-sm text-muted-foreground">[{p.teamTag}]</div>
                                    </TableCell>
                                    <TableCell>{p.registeredByName}</TableCell>
                                    <TableCell className="text-right">
                                        {Array.isArray(p.players) && p.players.length > 0 && (
                                            <Accordion type="single" collapsible className="w-full mt-1">
                                                <AccordionItem value="item-1" className="border-b-0">
                                                    <AccordionTrigger className="text-xs py-1 hover:no-underline flex justify-end">View ({p.players.length})</AccordionTrigger>
                                                    <AccordionContent>
                                                        <ul className="list-none space-y-2 pt-2 text-left">
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                           <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No teams in this category yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
    