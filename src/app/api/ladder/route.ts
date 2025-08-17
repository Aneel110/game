
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { unstable_cache } from 'next/cache';

type LadderTeam = {
  id: string;
  teamName: string;
  logoUrl?: string;
  points: number;
  rank: number;
};

type TournamentLadder = {
  tournamentId: string;
  tournamentName: string;
  teams: LadderTeam[];
};

const getLadderData = unstable_cache(
  async () => {
    if (!db) {
      return { error: "Firebase Admin is not configured." };
    }
    try {
      const tournamentsSnapshot = await db.collection("tournaments").orderBy('date', 'desc').get();
      const allTournamentLadders: TournamentLadder[] = [];

      for (const tournamentDoc of tournamentsSnapshot.docs) {
        const registrationsSnapshot = await tournamentDoc.ref
          .collection('registrations')
          .where('status', '==', 'approved')
          .where('selected', '==', true)
          .get();
        
        if (registrationsSnapshot.empty) {
            continue;
        }

        const tournamentData = tournamentDoc.data();
        const leaderboard = tournamentData.leaderboard || [];
        const leaderboardMap = new Map(leaderboard.map((t: any) => [t.teamName, t]));

        const ladderTeams: Omit<LadderTeam, 'rank'>[] = [];

        registrationsSnapshot.docs.forEach(regDoc => {
          const regData = regDoc.data();
          const leaderboardStats = leaderboardMap.get(regData.teamName) || {};

          ladderTeams.push({
            id: `${tournamentDoc.id}-${regDoc.id}`,
            teamName: regData.teamName,
            logoUrl: leaderboardStats.logoUrl,
            points: leaderboardStats.points || 0,
          });
        });

        ladderTeams.sort((a, b) => b.points - a.points);
      
        const rankedTeams = ladderTeams.map((team, index) => ({
          ...team,
          rank: index + 1,
        }));
        
        allTournamentLadders.push({
            tournamentId: tournamentDoc.id,
            tournamentName: tournamentData.name,
            teams: rankedTeams,
        });
      }

      return { tournaments: allTournamentLadders };
    } catch (error) {
      console.error("Error fetching ladder data:", error);
      return { error: "Failed to fetch ladder data." };
    }
  },
  ['public_ladder_data'],
  { revalidate: 300, tags: ['tournaments', 'registrations'] }
);

export async function GET() {
  const { tournaments, error } = await getLadderData();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(tournaments);
}
