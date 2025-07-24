import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Trophy, AlertTriangle } from 'lucide-react';
import { db } from "@/lib/firebase-admin";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Tournament = {
  id: string;
  name: string;
  date: string | Timestamp;
  prize: string;
  status: string;
  image: string;
  dataAiHint?: string;
};

async function getTournaments() {
  if (!db) {
    return { success: false, error: "Server-side Firebase is not configured. Please set the FIREBASE_SERVICE_ACCOUNT_KEY in your .env file." };
  }
  try {
    const q = query(collection(db, "tournaments"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const data: Tournament[] = [];
    querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({ 
          id: doc.id, 
          name: docData.name,
          // Convert Timestamp to a serializable format if it's a Timestamp object
          date: docData.date instanceof Timestamp ? docData.date.toDate().toISOString().split('T')[0] : docData.date,
          prize: docData.prize,
          status: docData.status,
          image: docData.image,
          dataAiHint: docData.dataAiHint,
        });
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return { success: false, error: "Could not connect to the database. Please ensure Firestore is enabled and permissions are correct." };
  }
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
  const { success, data: tournaments, error } = await getTournaments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold">Tournaments</h1>
        <p className="text-muted-foreground mt-2">Find your next challenge. Compete and conquer.</p>
      </div>
      
      {!success && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            {error} Please follow the setup instructions to enable Firestore in the Firebase Console.
          </AlertDescription>
        </Alert>
      )}

      {tournaments && tournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((t: Tournament) => (
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
                    <span>{typeof t.date === 'string' ? t.date : t.date.toDateString()}</span>
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
      )}

      {success && tournaments?.length === 0 && (
         <Card className="text-center p-8">
            <CardTitle>No Tournaments Found</CardTitle>
            <p className="text-muted-foreground mt-2">It looks like the database is empty. Have you seeded the data from the admin dashboard?</p>
          </Card>
      )}
    </div>
  );
}
