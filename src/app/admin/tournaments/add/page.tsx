import TournamentForm from '../tournament-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddTournamentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <TournamentForm />
      </CardContent>
    </Card>
  );
}
