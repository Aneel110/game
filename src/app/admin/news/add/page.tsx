
import NewsForm from '../news-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddNewsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New News Item</CardTitle>
      </CardHeader>
      <CardContent>
        <NewsForm />
      </CardContent>
    </Card>
  );
}
