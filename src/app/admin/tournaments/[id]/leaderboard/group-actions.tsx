
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { updateTeamGroup } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GroupActionsProps {
  tournamentId: string;
  teamName: string;
  currentGroup: 'A' | 'B';
}

export default function GroupActions({ tournamentId, teamName, currentGroup }: GroupActionsProps) {
    const { toast } = useToast();
    const [group, setGroup] = useState(currentGroup);

    const handleGroupChange = async (newGroup: 'A' | 'B') => {
        if (newGroup === group) return;
        
        const result = await updateTeamGroup(tournamentId, teamName, newGroup);
        if (result.success) {
            setGroup(newGroup);
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Group {group}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={group} onValueChange={(val) => handleGroupChange(val as 'A' | 'B')}>
                    <DropdownMenuRadioItem value="A">Group A</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="B">Group B</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

    