
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin is not configured." }, { status: 500 });
  }

  try {
    const now = new Date();
    const tournamentsSnapshot = await db.collection("tournaments").get();
    
    const finishedTournaments = tournamentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => {
            if (!t.date) return false;
            const tournamentDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
            // A tournament is finished if its date is in the past.
            // It should be shown even if the leaderboard is not populated yet.
            return tournamentDate < now;
        })
        .sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

    // Ensure leaderboard is always an array
    const tournamentsWithLeaderboards = finishedTournaments.map(t => ({
        ...t,
        leaderboard: t.leaderboard || [],
    }));

    return NextResponse.json(tournamentsWithLeaderboards);

  } catch (error) {
    console.error("Error fetching finished tournaments:", error);
    return NextResponse.json({ error: "Failed to fetch tournament data." }, { status: 500 });
  }
}
