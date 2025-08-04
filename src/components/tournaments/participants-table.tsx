
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
                            <TableHead>Team Tag</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length > 0 ? (
                            participants.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.teamName}</TableCell>
                                    <TableCell>{p.teamTag}</TableCell>
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
