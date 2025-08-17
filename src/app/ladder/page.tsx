
import { BarChart } from "lucide-react";
import LadderDisplay from "./ladder-display";

export default async function LadderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold flex items-center justify-center gap-4 text-shadow-lg animate-fade-in-down">
          <BarChart className="w-12 h-12 text-primary" />
          Tournament Ladders
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
           Select a tournament to view its competitive ladder.
        </p>
      </div>

      <LadderDisplay />
      
    </div>
  );
}
