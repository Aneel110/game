
import LeaderboardForm from '../../../leaderboard-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditLeaderboardEntryPageProps = {
    params: {
        id: string; // tournamentId
        playerId: string; // This is the player name (used as ID)
    }
}

async function getLeaderboardEntry(tournamentId: string, playerId: string) {
    if (!db) return null;
    const docRef = db.collection("tournaments").doc(tournamentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    const leaderboard = data?.leaderboard || [];
    // The playerId is URL-encoded, so we need to decode it.
    const decodedPlayerId = decodeURIComponent(playerId);
    const entry = leaderboard.find((e: any) => e.player === decodedPlayerId);
    
    return entry || null;
}

export default async function EditLeaderboardEntryPage({ params }: EditLeaderboardEntryPageProps) {
  const entry = await getLeaderboardEntry(params.id, params.playerId);

  if (!entry) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Leaderboard Entry: {entry.player}</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardForm tournamentId={params.id} entryPlayerName={params.playerId} defaultValues={entry} />
      </CardContent>
    </Card>
  );
}
