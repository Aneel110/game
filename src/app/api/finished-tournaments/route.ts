
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';

const getFinishedTournaments = unstable_cache(
  async () => {
    if (!db) {
      console.error("Firebase Admin is not configured.");
      return { error: "Firebase Admin is not configured." };
    }
    try {
      const now = new Date();
      const tournamentsSnapshot = await db.collection("tournaments").get();
      
      const finishedTournaments = tournamentsSnapshot.docs
          .map(doc => {
              const data = doc.data();
              return { 
                id: doc.id, 
                ...data,
                date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
              }
          })
          .filter(t => {
              if (!t.date) return false;
              const tournamentDate = new Date(t.date);
              return tournamentDate < now;
          })
          .sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB.getTime() - dateA.getTime();
          });

      const tournamentsWithLeaderboards = finishedTournaments.map(t => ({
          ...t,
          leaderboard: t.leaderboard || [],
      }));

      return { tournaments: tournamentsWithLeaderboards };
    } catch (error) {
      console.error("Error fetching finished tournaments:", error);
      return { error: "Failed to fetch tournament data." };
    }
  },
  ['finished_tournaments'],
  { revalidate: 300, tags: ['tournaments'] } // Revalidate every 5 minutes
)


export async function GET() {
  const { tournaments, error } = await getFinishedTournaments();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(tournaments);
}
