
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateTeamGroup } from '@/lib/actions';
import { Check, Edit, X } from 'lucide-react';

interface GroupActionsProps {
  tournamentId: string;
  teamName: string;
  currentGroup?: string;
}

export default function GroupActions({ tournamentId, teamName, currentGroup }: GroupActionsProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [group, setGroup] = useState(currentGroup || '');
  const [isLoading, setIsLoading] = useState(false);

  // This useEffect ensures the local state updates when the prop changes.
  // This is crucial for the real-time update to work correctly.
  useEffect(() => {
    setGroup(currentGroup || '');
  }, [currentGroup]);


  const handleSave = async () => {
    if (group === currentGroup) {
      setIsEditing(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const newGroup = group.trim() === '' ? null : group.trim().toUpperCase();
      const result = await updateTeamGroup(tournamentId, teamName, newGroup);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setIsEditing(false);
        // The real-time listener will handle the UI update.
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGroup(currentGroup || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="h-8 w-24"
          disabled={isLoading}
          placeholder="e.g., A"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSave} disabled={isLoading}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel} disabled={isLoading}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group min-h-[32px]">
      <span>{currentGroup ? `Group ${currentGroup}` : 'Unassigned'}</span>
      <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => setIsEditing(true)}>
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
