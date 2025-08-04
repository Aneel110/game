
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const revalidate = 60; // Revalidate every 60 seconds

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
            return tournamentDate < now && t.leaderboard && t.leaderboard.length > 0;
        })
        .sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

    return NextResponse.json(finishedTournaments);

  } catch (error) {
    console.error("Error fetching finished tournaments:", error);
    return NextResponse.json({ error: "Failed to fetch tournament data." }, { status: 500 });
  }
}
