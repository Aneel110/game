
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase-admin";
import { Signal, Clapperboard, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getStreams() {
    const streamsSnapshot = await db.collection('streams').orderBy('createdAt', 'desc').get();
    const streams = streamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const live = streams.filter(s => s.status === 'Live');
    const upcoming = streams.filter(s => s.status === 'Upcoming');
    const past = streams.filter(s => s.status === 'Past');

    return { live, upcoming, past };
}

function StreamCard({ stream }: { stream: any }) {
    const videoId = stream.youtubeUrl.split('/').pop();
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
        <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="p-0">
                 <Image src={thumbnailUrl} alt={stream.title} width={600} height={400} className="w-full aspect-video object-cover" />
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-lg font-bold line-clamp-2">{stream.title}</CardTitle>
            </CardContent>
        </Card>
    )
}

function getWatchUrl(embedUrl: string) {
    const videoId = embedUrl.split('/').pop();
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export default async function StreamsPage() {
    const { live, upcoming, past } = await getStreams();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-headline font-bold">Streams</h1>
                <p className="text-muted-foreground mt-2">Watch live tournaments, past matches, and more.</p>
            </div>

            {/* Live Streams */}
            <section className="mb-12">
                <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3 text-destructive">
                    <Signal className="animate-pulse" /> Live Now
                </h2>
                {live.length > 0 ? (
                    <div className="aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden border-4 border-destructive bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={live[0].youtubeUrl}
                            title={live[0].title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <Card className="text-center p-8">
                        <CardTitle>No Live Streams</CardTitle>
                        <p className="text-muted-foreground mt-2">Check back later for live events!</p>
                    </Card>
                )}
            </section>

            {/* Upcoming Streams */}
            <section className="mb-12">
                <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3 text-primary">
                    <Calendar /> Upcoming
                </h2>
                {upcoming.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map(stream => (
                            <Link key={stream.id} href={getWatchUrl(stream.youtubeUrl)} target="_blank">
                                <StreamCard stream={stream} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No upcoming streams scheduled.</p>
                )}
            </section>

            {/* Past Streams */}
            <section>
                <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3">
                    <Clapperboard /> Past Broadcasts
                </h2>
                 {past.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {past.map(stream => (
                             <Link key={stream.id} href={getWatchUrl(stream.youtubeUrl)} target="_blank">
                                <StreamCard stream={stream} />
                            </Link>
                        ))}
                    </div>
                ) : (
                     <p className="text-muted-foreground">No past broadcasts available.</p>
                )}
            </section>
        </div>
    );
}
