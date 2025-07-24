import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Trophy } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

async function getTournaments() {
    const q = query(collection(db, "tournaments"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'Upcoming':
      return 'bg-blue-500';
    case 'Ongoing':
      return 'bg-green-500';
    case 'Finished':
      return 'bg-gray-500';
    default:
      return 'bg-secondary';
  }
};

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold">Tournaments</h1>
        <p className="text-muted-foreground mt-2">Find your next challenge. Compete and conquer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((t) => (
          <Card key={t.id} className="flex flex-col overflow-hidden hover:shadow-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-0 relative">
              <Image src={t.image} alt={t.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={t.dataAiHint} />
              <Badge className={`absolute top-4 right-4 text-white ${getStatusColor(t.status)}`}>{t.status}</Badge>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardTitle className="font-headline text-2xl mb-2">{t.name}</CardTitle>
              <div className="flex items-center text-muted-foreground text-sm mb-4">
                <div className="flex items-center mr-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{t.date}</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-bold text-lg text-primary">${t.prize}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href={`/tournaments/${t.id}`}>
                  View Details <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
