'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

// In a real app, you'd get the user's ID from their session.
// For now, we'll use a mock user.
const MOCK_USER = {
  id: 'mock_user_1',
  name: 'NewChallenger',
  avatar: 'https://placehold.co/40x40.png'
};

export async function registerForTournament(tournamentId: string) {
  if (!tournamentId) {
    return { success: false, message: 'Tournament ID is required.' };
  }

  try {
    const registrationRef = db.collection('tournaments').doc(tournamentId).collection('registrations').doc(MOCK_USER.id);

    const doc = await registrationRef.get();

    if (doc.exists) {
        return { success: false, message: 'You are already registered for this tournament.' };
    }

    await registrationRef.set({
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      status: 'pending',
      registeredAt: new Date(),
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, message: 'Registration successful! Your registration is pending approval.' };
  } catch (error) {
    console.error('Error registering for tournament:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getTournamentRegistrations(tournamentId: string) {
    if (!tournamentId) {
        return { success: false, data: [], message: 'Tournament ID is required.' };
    }
    try {
        const registrationsSnapshot = await db.collection('tournaments').doc(tournamentId).collection('registrations').get();
        const registrations = registrationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: registrations };
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return { success: false, data: [], message: 'Failed to fetch registrations.' };
    }
}


export async function updateRegistrationStatus(tournamentId: string, registrationId: string, status: 'approved' | 'declined') {
    if (!tournamentId || !registrationId || !status) {
        return { success: false, message: 'Missing required parameters.' };
    }
    try {
        const registrationRef = db.collection('tournaments').doc(tournamentId).collection('registrations').doc(registrationId);
        await registrationRef.update({ status });
        revalidatePath(`/admin/tournaments/${tournamentId}`);
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error('Error updating registration status:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
