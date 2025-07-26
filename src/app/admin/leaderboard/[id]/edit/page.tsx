
import LeaderboardForm from '../../leaderboard-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditLeaderboardEntryPageProps = {
    params: {
        id: string;
    }
}

async function getLeaderboardEntry(id: string) {
    if (!db) return null;
    const docRef = db.collection("leaderboard").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
    };
}

export default async function EditLeaderboardEntryPage({ params }: EditLeaderboardEntryPageProps) {
  const entry = await getLeaderboardEntry(params.id);

  if (!entry) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Leaderboard Entry: {entry.player}</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardForm entryId={entry.id} defaultValues={entry} />
      </CardContent>
    </Card>
  );
}
