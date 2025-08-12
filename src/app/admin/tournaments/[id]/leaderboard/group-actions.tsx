
'use client';

<<<<<<< HEAD
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
=======
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateTeamGroup } from '@/lib/actions';
>>>>>>> 56c742d778ee53cffcfe472680a4b87000408193

interface GroupActionsProps {
  tournamentId: string;
  teamName: string;
<<<<<<< HEAD
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

    
=======
  currentGroup?: 'A' | 'B';
}

export default function GroupActions({ tournamentId, teamName, currentGroup }: GroupActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGroupChange = async (newGroup: 'A' | 'B' | 'auto') => {
    setIsLoading(true);
    try {
      const result = await updateTeamGroup(tournamentId, teamName, newGroup === 'auto' ? null : newGroup);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      onValueChange={handleGroupChange}
      defaultValue={currentGroup || 'auto'}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[100px] h-8">
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="A">Group A</SelectItem>
        <SelectItem value="B">Group B</SelectItem>
      </SelectContent>
    </Select>
  );
}
>>>>>>> 56c742d778ee53cffcfe472680a4b87000408193
