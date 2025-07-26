
import TournamentForm from '../../tournament-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

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

    return {
        id: docSnap.id,
        name: data.name || '',
        date: data.date || '',
        prize: data.prize || 0,
        status: data.status || 'Upcoming',
        mode: data.mode || 'Squads',
        image: data.image || '',
        dataAiHint: data.dataAiHint || '',
        description: data.description || '',
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
