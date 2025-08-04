
'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateRegistrationStatus } from "@/lib/actions";
import { Check, X, Undo2 } from "lucide-react";
import { useState } from "react";

type RegistrationStatus = 'approved' | 'declined' | 'pending';

interface RegistrationActionsProps {
    tournamentId: string;
    registrationId: string;
    currentStatus: RegistrationStatus;
    teamName: string;
}

export default function RegistrationActions({ tournamentId, registrationId, currentStatus, teamName }: RegistrationActionsProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<RegistrationStatus | null>(null);

    const handleUpdate = async (status: RegistrationStatus) => {
        setIsLoading(status);
        try {
            const result = await updateRegistrationStatus(tournamentId, registrationId, status, teamName);
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
             {currentStatus === 'pending' && (
                <>
                    <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => handleUpdate('approved')} disabled={!!isLoading}>
                        <Check className="h-4 w-4 mr-2" /> {isLoading === 'approved' ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleUpdate('declined')} disabled={!!isLoading}>
                        <X className="h-4 w-4 mr-2" /> {isLoading === 'declined' ? 'Declining...' : 'Decline'}
                    </Button>
                </>
            )}
            {currentStatus === 'approved' && (
                 <>
                    <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500" onClick={() => handleUpdate('pending')} disabled={!!isLoading}>
                        <Undo2 className="h-4 w-4 mr-2" /> {isLoading === 'pending' ? 'Setting to Pending...' : 'Set to Pending'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleUpdate('declined')} disabled={!!isLoading}>
                        <X className="h-4 w-4 mr-2" /> {isLoading === 'declined' ? 'Declining...' : 'Decline'}
                    </Button>
                </>
            )}
        </div>
    )
}
