
'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
    if (!userId || !role) {
        return { success: false, message: 'Missing required parameters.' };
    }
    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ role });
        revalidatePath('/admin/users');
        return { success: true, message: `User role updated to ${role}.` };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  date: z.string().min(1, 'Date is required.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  status: z.enum(['Upcoming', 'Ongoing', 'Finished']),
  mode: z.string().min(1, 'Mode is required.'),
  image: z.string().url('Image must be a valid URL.'),
  dataAiHint: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export async function createTournament(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = tournamentSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const { id, ...dataToSave } = validatedFields.data; // zod adds this if not specified
        await db.collection('tournaments').add(dataToSave);
        revalidatePath('/tournaments');
        revalidatePath('/admin/tournaments');
        return { success: true, message: 'Tournament created successfully.' };
    } catch (error) {
        console.error('Error creating tournament:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateTournament(id: string, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = tournamentSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.collection('tournaments').doc(id).update(validatedFields.data);
        revalidatePath('/tournaments');
        revalidatePath(`/tournaments/${id}`);
        revalidatePath('/admin/tournaments');
        revalidatePath(`/admin/tournaments/${id}/edit`);
        return { success: true, message: 'Tournament updated successfully.' };
    } catch (error) {
        console.error('Error updating tournament:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteTournament(id: string) {
    if (!id) {
        return { success: false, message: 'Tournament ID is required.' };
    }
    try {
        // Here you might want to also delete subcollections like registrations
        await db.collection('tournaments').doc(id).delete();
        revalidatePath('/tournaments');
        revalidatePath('/admin/tournaments');
        return { success: true, message: 'Tournament deleted successfully.' };
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
