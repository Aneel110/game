'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateRegistrationStatus } from "@/lib/actions";
import { Check, X } from "lucide-react";
import { useState } from "react";

export default function RegistrationActions({ tournamentId, registrationId }: { tournamentId: string, registrationId: string }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<'approve' | 'decline' | null>(null);

    const handleUpdate = async (status: 'approved' | 'declined') => {
        setIsLoading(status === 'approved' ? 'approve' : 'decline');
        try {
            const result = await updateRegistrationStatus(tournamentId, registrationId, status);
            if(result.success) {
                toast({ title: 'Success', description: result.message });
            } else {
                toast({ title: 'Error', description: result.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(null);
        }
    }

    return (
        <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => handleUpdate('approved')} disabled={!!isLoading}>
                <Check className="h-4 w-4 mr-2" /> {isLoading === 'approve' ? 'Approving...' : 'Approve'}
            </Button>
            <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleUpdate('declined')} disabled={!!isLoading}>
                <X className="h-4 w-4 mr-2" /> {isLoading === 'decline' ? 'Declining...' : 'Decline'}
            </Button>
        </div>
    )
}
