import TournamentDetail from "@/components/tournaments/tournament-detail";
import { db } from "@/lib/firebase-admin";

type TournamentDetailPageProps = {
    params: {
        id: string;
    }
}

async function getTournamentData(id: string) {
    const docRef = db.collection("tournaments").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
}

async function getRegistrations(id: string) {
    const registrationsSnapshot = await db.collection('tournaments').doc(id).collection('registrations').get();
    // Convert Firestore Timestamps to serializable strings
    const registrations = registrationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            registeredAt: data.registeredAt.toDate().toISOString(),
        };
    });
    return registrations;
}


export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
    const tournament = await getTournamentData(params.id);
    const registrations = await getRegistrations(params.id);

    if (!tournament) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold">Tournament not found</h1>
                <p className="text-muted-foreground mt-2">The tournament you are looking for does not exist.</p>
            </div>
        )
    }

    return <TournamentDetail tournament={tournament} registrations={registrations} />;
}
