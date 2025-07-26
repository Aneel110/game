

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import DeleteStreamButton from "./delete-stream-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getStreams() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." }
    }
    const streamsSnapshot = await db.collection('streams').orderBy('createdAt', 'desc').get();
    return { streams: streamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Live':
            return <Badge variant="destructive">Live</Badge>;
        case 'Upcoming':
            return <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>;
        case 'Past':
            return <Badge variant="secondary">Past</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
}

export default async function AdminStreamsPage() {
    const { streams, error } = await getStreams();

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Server Configuration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Streams</CardTitle>
                <Button asChild>
                    <Link href="/admin/streams/add">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Stream
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {streams && streams.map((s: any) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.title}</TableCell>
                                <TableCell>{getStatusBadge(s.status)}</TableCell>
                                <TableCell>
                                    <Link href={s.youtubeUrl} target="_blank" className="text-primary hover:underline truncate">
                                        {s.youtubeUrl}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/streams/${s.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteStreamButton streamId={s.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!streams || streams.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No streams found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
