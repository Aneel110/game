
import LeaderboardForm from '../leaderboard-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddLeaderboardEntryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Leaderboard Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardForm />
      </CardContent>
    </Card>
  );
}
