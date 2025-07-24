import TournamentDetail from "@/components/tournaments/tournament-detail";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type TournamentDetailPageProps = {
    params: {
        id: string;
    }
}

async function getTournamentData(id: string) {
    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
}


export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
    const tournament = await getTournamentData(params.id);

    if (!tournament) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold">Tournament not found</h1>
                <p className="text-muted-foreground mt-2">The tournament you are looking for does not exist.</p>
            </div>
        )
    }

    return <TournamentDetail tournament={tournament} />;
}
