import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Trophy, Shield, GitCommitHorizontal } from "lucide-react";

const user = {
  name: "ShadowStriker",
  avatar: "https://placehold.co/128x128.png",
  bio: "Pro player since 2018. IGL for team Vipers. Streaming competitive gameplay daily.",
  stats: [
    { label: "K/D Ratio", value: "4.75" },
    { label: "Wins", value: "128" },
    { label: "Avg. Damage", value: "650.2" },
    { label: "Tournaments Won", value: "5" },
  ],
  achievements: [
    { name: "Tournament Champion", icon: Trophy },
    { name: "First Win", icon: Shield },
    { name: "Community Contributor", icon: GitCommitHorizontal },
    { name: "Season 1 Veteran", icon: Trophy },
  ],
};

export default function ProfilePage() {
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
                {user.stats.map((stat) => (
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
                {user.achievements.map((ach) => (
                  <Badge key={ach.name} variant="outline" className="text-lg p-3 border-accent text-accent">
                    <ach.icon className="w-5 h-5 mr-2" />
                    {ach.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
