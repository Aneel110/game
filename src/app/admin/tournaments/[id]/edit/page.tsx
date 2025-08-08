
import TournamentForm from '../../tournament-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Timestamp } from 'firebase-admin/firestore';

type EditTournamentPageProps = {
    params: {
        id: string;
    }
}

async function getTournamentData(id: string) {
    if (!db) return null;
    const docRef = db.collection("tournaments").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    if (!data) return null;
    
    const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;

    return {
        id: docSnap.id,
        name: data.name || '',
        date: date,
        prizeDistribution: data.prizeDistribution || { first: 0, second: 0, third: 0, fourth: 0, fifth: 0, topKills: 0 },
        mode: data.mode || 'Squads',
        image: data.image || '',
        dataAiHint: data.dataAiHint || '',
        description: data.description || '',
        rules: data.rules || '',
        registrationOpen: data.registrationOpen !== false, // Default to true if not set
    };
}


export default async function EditTournamentPage({ params }: EditTournamentPageProps) {
  const tournament = await getTournamentData(params.id);

  if (!tournament) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Tournament: {tournament.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <TournamentForm tournamentId={tournament.id} defaultValues={tournament} />
      </CardContent>
    </Card>
  );
}

    