
'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

interface Player {
  pubgName: string;
  pubgId: string;
  discordUsername?: string;
}

interface RegistrationData {
  teamName: string;
  teamTag: string;
  players: Player[];
  registeredById: string;
  registeredByName: string;
}

export async function registerForTournament(tournamentId: string, data: RegistrationData) {
  if (!tournamentId) {
    return { success: false, message: 'Tournament ID is required.' };
  }
  if (!data.registeredById) {
      return { success: false, message: 'User is not logged in.' };
  }

  try {
    const registrationRef = db.collection('tournaments').doc(tournamentId).collection('registrations').doc(data.registeredById);

    const doc = await registrationRef.get();

    if (doc.exists) {
        return { success: false, message: 'You have already registered a team for this tournament.' };
    }

    await registrationRef.set({
      ...data,
      status: 'pending',
      registeredAt: new Date(),
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    return { success: true, message: 'Registration successful! Your registration is pending approval.' };
  } catch (error) {
    console.error('Error registering for tournament:', error);
    return { success: false, message: 'An unexpected error occurred during registration.' };
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
        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error('Error updating registration status:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
