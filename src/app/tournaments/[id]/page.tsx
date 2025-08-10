

import TournamentDetail from "@/components/tournaments/tournament-detail";
import { db } from "@/lib/firebase-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Timestamp } from "firebase-admin/firestore";

type TournamentDetailPageProps = {
    params: {
        id: string;
    }
}

async function getTournamentData(id: string) {
    if (!db) {
        return { error: "Server-side Firebase is not configured correctly." };
    }
    try {
        const docRef = db.collection("tournaments").doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.date && data.date instanceof Timestamp) {
                data.date = data.date.toDate().toISOString();
            }
            return { tournament: { id: docSnap.id, ...data } };
        } else {
            return { tournament: null };
        }
    } catch (error: any) {
        return { error: "Failed to fetch tournament data. Ensure Firestore is enabled and permissions are correct." };
    }
}

async function getRegistrations(id: string) {
     if (!db) {
        return { error: "Server-side Firebase is not configured correctly." };
    }
    try {
        const registrationsSnapshot = await db.collection('tournaments').doc(id).collection('registrations').get();
        // Convert Firestore Timestamps to serializable strings
        const registrations = registrationsSnapshot.docs.map(doc => {
            const data = doc.data();
            const registeredAt = data.registeredAt;
            return { 
                id: doc.id, 
                ...data,
                registeredAt: registeredAt instanceof Timestamp ? registeredAt.toDate().toISOString() : new Date().toISOString(),
            };
        });
        return { registrations };
    } catch (error: any) {
        return { error: "Failed to fetch registrations. Ensure Firestore is enabled and permissions are correct." };
    }
}


export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
    const { tournament, error: tournamentError } = await getTournamentData(params.id);
    const { registrations, error: registrationError } = await getRegistrations(params.id);
    const error = tournamentError || registrationError;

    if (error) {
         return (
            <div className="container mx-auto px-4 py-8">
                 <Card className="p-8">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Could not load tournament data</AlertTitle>
                        <AlertDescription>
                            {error} Please ensure your `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly in your environment variables.
                        </AlertDescription>
                    </Alert>
                 </Card>
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold">Tournament not found</h1>
                <p className="text-muted-foreground mt-2">The tournament you are looking for does not exist.</p>
            </div>
        )
    }

    return <TournamentDetail tournament={tournament} registrations={registrations || []} />;
}
