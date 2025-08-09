
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import FinalistForm from './finalist-form';

type FinalistsPageProps = {
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
    
    const approvedSnapshot = await docRef.collection('registrations').where('status', '==', 'approved').get();
    const approvedTeams = approvedSnapshot.docs.map(doc => doc.data().teamName);

    return {
        id: docSnap.id,
        name: data.name || '',
        finalistLeaderboardActive: data.finalistLeaderboardActive || false,
        finalistLeaderboard: data.finalistLeaderboard || [],
        approvedTeams,
    };
}


export default async function FinalistsPage({ params }: FinalistsPageProps) {
  const tournament = await getTournamentData(params.id);

  if (!tournament) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Finalists: {tournament.name}</CardTitle>
        <CardDescription>
            Enable and build the finalist leaderboard. Select teams from the approved list and set their points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FinalistForm tournamentId={tournament.id} defaultValues={tournament} approvedTeams={tournament.approvedTeams} />
      </CardContent>
    </Card>
  );
}
