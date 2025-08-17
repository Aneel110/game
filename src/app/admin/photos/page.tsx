
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { PlusCircle, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DeletePhotoButton from "./delete-photo-button";
import { Timestamp } from "firebase-admin/firestore";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

async function getPhotos() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." }
    }
    const photosSnapshot = await db.collection('photos').orderBy('createdAt', 'desc').get();
    return { photos: photosSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() 
        }
    }) };
}

export default async function AdminPhotosPage() {
    const { photos, error } = await getPhotos();

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
                <CardTitle>Manage Photos</CardTitle>
                <Button asChild>
                    <Link href="/admin/photos/add">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Photo
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Preview</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Image URL</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {photos && photos.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Avatar className="h-10 w-10 rounded-md">
                                        <AvatarImage src={item.imageUrl} alt={item.title} className="object-cover" />
                                        <AvatarFallback className="rounded-md">{item.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Input type="text" readOnly value={item.imageUrl} className="flex-grow text-xs" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/photos/${item.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeletePhotoButton photoId={item.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!photos || photos.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No photos found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
