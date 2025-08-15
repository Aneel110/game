
import NewsForm from '../../news-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditNewsPageProps = {
    params: {
        id: string;
    }
}

async function getNewsData(id: string) {
    if (!db) return null;
    const docRef = db.collection("news").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    if (!data) return null;
    
    return {
        id: docSnap.id,
        title: data.title || '',
        content: data.content || '',
    };
}


export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const newsItem = await getNewsData(params.id);

  if (!newsItem) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit News: {newsItem.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <NewsForm newsId={newsItem.id} defaultValues={newsItem} />
      </CardContent>
    </Card>
  );
}
