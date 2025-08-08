
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, Shield, GitCommitHorizontal, AlertTriangle, User, LogIn } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "./edit-profile-dialog";

const iconMap: { [key: string]: React.ElementType } = {
  Trophy,
  Shield,
  GitCommitHorizontal,
};

type UserProfile = {
  displayName: string;
  avatar: string;
  bio: string;
  stats: { label: string; value: string }[];
  achievements: { name: string; icon: string }[];
};

function ProfileSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start gap-6">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-grow space-y-2 mt-2">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-6" />
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-4" />
                        <div className="flex flex-wrap gap-4">
                            <Skeleton className="h-10 w-28" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUserData() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            displayName: data.displayName || 'No Name',
            avatar: user.photoURL || "https://placehold.co/128x128.png",
            bio: data.bio || "This user hasn't set a bio yet.",
            stats: data.stats || [],
            achievements: data.achievements || [],
          });
        } else {
          // Create a default profile if one doesn't exist
           setProfile({
            displayName: user.displayName || 'New User',
            avatar: user.photoURL || "https://placehold.co/128x128.png",
            bio: "Welcome to your new profile!",
            stats: [],
            achievements: [],
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Could not connect to the database. Please ensure Firestore is enabled in your Firebase project.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      getUserData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!user || !profile) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-md mx-auto text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <LogIn className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-headline">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        You must be logged in to view this page.
                    </p>
                    <Button asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-headline font-bold">{profile.displayName}</h1>
              <EditProfileDialog user={user} profile={profile} />
            </div>
            <p className="text-muted-foreground mt-2">{profile.bio}</p>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-headline font-semibold mb-4">Player Stats</h2>
              {profile.stats.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {profile.stats.map((stat: any) => (
                    <Card key={stat.label} className="p-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No stats to display yet.</p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-headline font-semibold mb-4">Achievements</h2>
              {profile.achievements.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {profile.achievements.map((ach: any) => {
                    const Icon = iconMap[ach.icon] || Trophy;
                    return (
                      <Badge key={ach.name} variant="outline" className="text-lg p-3 border-accent text-accent">
                        <Icon className="w-5 h-5 mr-2" />
                        {ach.name}
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No achievements unlocked yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
