
import PhotoForm from '../photo-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddPhotoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoForm />
      </CardContent>
    </Card>
  );
}
