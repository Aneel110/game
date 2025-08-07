
import LeaderboardForm from '../../leaderboard-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditLeaderboardEntryPageProps = {
    params: {
        id: string; // tournamentId
        playerId: string; // This is the team name (used as ID)
    }
}

async function getLeaderboardEntry(tournamentId: string, teamId: string) {
    if (!db) return null;
    const docRef = db.collection("tournaments").doc(tournamentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    const leaderboard = data?.leaderboard || [];
    // The teamId is URL-encoded, so we need to decode it.
    const decodedTeamId = decodeURIComponent(teamId);
    const entry = leaderboard.find((e: any) => e.teamName === decodedTeamId);
    
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
        <CardTitle>Edit Leaderboard Entry: {decodeURIComponent(params.playerId)}</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardForm tournamentId={params.id} entryTeamName={params.playerId} defaultValues={entry} />
      </CardContent>
    </Card>
  );
}
