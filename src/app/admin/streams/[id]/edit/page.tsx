

import StreamForm from '../../stream-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type EditStreamPageProps = {
    params: {
        id: string;
    }
}

function getWatchUrl(embedUrl: string | undefined): string {
    if (!embedUrl) return '';
    const videoId = embedUrl.split('/').pop()?.split('?')[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
}

async function getStreamData(id: string) {
    if (!db) return null;
    const docRef = db.collection("streams").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    if (!data) return null;

    // The form expects a regular youtube.com/watch?v=... URL, but we store the embed URL.
    const originalUrl = getWatchUrl(data.youtubeUrl);
    
    return {
        id: docSnap.id,
        title: data.title || '',
        youtubeUrl: originalUrl,
        status: data.status || 'Past',
    };
}


export default async function EditStreamPage({ params }: EditStreamPageProps) {
  const stream = await getStreamData(params.id);

  if (!stream) {
      notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Stream: {stream.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <StreamForm streamId={stream.id} defaultValues={stream} />
      </CardContent>
    </Card>
  );
}
