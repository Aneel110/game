
import StreamForm from '../stream-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddStreamPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Stream</CardTitle>
      </CardHeader>
      <CardContent>
        <StreamForm />
      </CardContent>
    </Card>
  );
}
