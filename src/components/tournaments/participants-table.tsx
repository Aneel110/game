
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ParticipantsTableProps {
    participants: any[];
    title: string;
    icon: React.ElementType;
}

export default function ParticipantsTable({ participants, title, icon: Icon }: ParticipantsTableProps) {
    return (
        <div className="[perspective:1000px]">
            <h3 className="text-xl font-headline font-semibold mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {title} ({participants.length})
            </h3>
            <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 hover:[transform:rotateX(5deg)]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-primary/20">
                            <TableHead>Team Name</TableHead>
                            <TableHead>Registered By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length > 0 ? (
                            participants.map(p => (
                                <TableRow key={p.id} className="border-b-primary/10 hover:bg-primary/10 transition-colors duration-200">
                                    <TableCell className="font-medium">{p.teamName}</TableCell>
                                    <TableCell>{p.registeredByName}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                           <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
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
