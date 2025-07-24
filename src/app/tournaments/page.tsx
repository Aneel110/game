import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Trophy } from 'lucide-react';

const tournaments = [
  { id: '1', name: 'Arena Clash: Season 5', date: '2024-08-15', prize: '50,000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'esports battle' },
  { id: '2', name: 'Solo Survival Challenge', date: '2024-08-20', prize: '10,000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'lone soldier' },
  { id: '3', name: 'Duo Destruction Derby', date: '2024-08-25', prize: '25,000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'gaming partners' },
  { id: '4', name: 'Squad Goals Championship', date: '2024-09-01', prize: '100,000', status: 'Upcoming', image: 'https://placehold.co/600x400.png', dataAiHint: 'team victory' },
  { id: '5', name: 'Summer Skirmish', date: '2024-07-10', prize: '20,000', status: 'Ongoing', image: 'https://placehold.co/600x400.png', dataAiHint: 'intense conflict' },
  { id: '6', name: 'King of the Hill', date: '2024-07-01', prize: '5,000', status: 'Finished', image: 'https://placehold.co/600x400.png', dataAiHint: 'royal crown' },
];

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

export default function TournamentsPage() {
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
