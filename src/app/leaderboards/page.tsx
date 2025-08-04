
import { Trophy } from "lucide-react";
import LeaderboardDisplay from "./leaderboard-display";

export default async function LeaderboardsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold flex items-center justify-center gap-4 text-shadow-lg animate-fade-in-down">
          <Trophy className="w-12 h-12 text-primary animate-pulse" />
          Free Pubg Tournament
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
           Browse the leaderboards from our free PUBG tournaments.
        </p>
      </div>

      <LeaderboardDisplay />
      
    </div>
  );
}
