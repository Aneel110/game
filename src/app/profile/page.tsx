import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Trophy, Shield, GitCommitHorizontal, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper to get user data - in a real app, you'd get the current user's ID
async function getUserData(userId = "shadowstriker_profile") {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
    } else {
        return { success: true, data: {
            name: "Player Not Found",
            avatar: "https://placehold.co/128x128.png",
            bio: "This player profile could not be retrieved from the database. Please seed the database from the admin dashboard.",
            stats: [],
            achievements: [],
        }};
    }
  } catch(error) {
    console.error("Error fetching user data:", error);
    return { success: false, error: "Could not connect to the database. Please ensure Firestore is enabled in your Firebase project." };
  }
}

const iconMap: { [key: string]: React.ElementType } = {
  Trophy,
  Shield,
  GitCommitHorizontal,
};

export default async function ProfilePage() {
  const { success, data: user, error } = await getUserData();

  if (!success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            {error} Please follow the setup instructions to enable Firestore in the Firebase Console.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-headline font-bold">{user.name}</h1>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <p className="text-muted-foreground mt-2">{user.bio}</p>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-headline font-semibold mb-4">Player Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                {user.stats.map((stat: any) => (
                  <Card key={stat.label} className="p-4">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-semibold mb-4">Achievements</h2>
              <div className="flex flex-wrap gap-4">
                {user.achievements.map((ach: any) => {
                  const Icon = iconMap[ach.icon];
                  return (
                    <Badge key={ach.name} variant="outline" className="text-lg p-3 border-accent text-accent">
                      {Icon && <Icon className="w-5 h-5 mr-2" />}
                      {ach.name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
