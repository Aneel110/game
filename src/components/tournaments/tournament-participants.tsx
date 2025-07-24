import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const MOCK_PARTICIPANTS = [
    { name: "ShadowStriker", avatar: "https://placehold.co/40x40.png" },
    { name: "Phoenix", avatar: "https://placehold.co/40x40.png" },
    { name: "Viper", avatar: "https://placehold.co/40x40.png" },
    { name: "Ghost", avatar: "https://placehold.co/40x40.png" },
]


export default function TournamentParticipants({ participants }: { participants?: any[] }) {

  const participantList = participants || MOCK_PARTICIPANTS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-3" />
            Participants ({participantList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {participantList.map(p => (
            <div key={p.name} className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{p.name}</span>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
