
'use client';

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

interface GroupActionsProps {
  tournamentId: string;
  teamName: string;
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

    