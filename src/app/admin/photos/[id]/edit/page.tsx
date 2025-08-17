
import PhotoForm from '../../photo-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditPhotoPageProps = {
    params: {
        id: string;
    }
}

async function getPhotoData(id: string) {
    if (!db) return null;
    const docRef = db.collection("photos").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    if (!data) return null;
    
    return {
        id: docSnap.id,
        title: data.title || '',
        imageUrl: data.imageUrl || '',
    };
}

export default async function EditPhotoPage({ params }: EditPhotoPageProps) {
  const photoItem = await getPhotoData(params.id);

  if (!photoItem) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Photo: {photoItem.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoForm photoId={photoItem.id} defaultValues={photoItem} />
      </CardContent>
    </Card>
  );
}
