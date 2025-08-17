
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LadderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-headline font-bold">Ladder</h1>
            <p className="text-muted-foreground mt-2">View the competitive ladder rankings.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                The competitive ladder is under construction. Check back soon!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The ladder will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
