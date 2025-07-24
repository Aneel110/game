import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function TournamentParticipants({ participants, title, icon: Icon }: { participants: any[], title: string, icon: React.ElementType }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Icon className="w-5 h-5 mr-3" />
            {title} ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length > 0 ? (
          participants.map(p => (
              <div key={p.id || p.name} className="flex items-center gap-4">
                  <Avatar>
                      <AvatarImage src={p.userAvatar || p.avatar} />
                      <AvatarFallback>{(p.userName || p.name).charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{p.userName || p.name}</span>
              </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No participants in this category yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
