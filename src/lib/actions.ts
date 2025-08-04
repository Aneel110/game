

'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { tournamentSchema, streamSchema, registrationSchema, RegistrationData } from '@/lib/schemas';


// Helper to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      return null;
    } catch (error) {
      return null;
    }
};

const transformToEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
}


export async function registerForTournament(tournamentId: string, data: RegistrationData) {
  if (!db) {
    return { success: false, message: 'Database not initialized.' };
  }
  
  const validatedFields = registrationSchema.safeParse(data);
  if (!validatedFields.success) {
      return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { registeredById } = validatedFields.data;

  try {
    const registrationRef = db.collection('tournaments').doc(tournamentId).collection('registrations').doc(registeredById);

    const doc = await registrationRef.get();

    if (doc.exists) {
        return { success: false, message: 'You have already registered a team for this tournament.' };
    }

    await registrationRef.set({
      ...validatedFields.data,
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
    if (!db) {
      return { success: false, data: [], message: 'Database not initialized.' };
    }
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


export async function updateRegistrationStatus(tournamentId: string, registrationId: string, status: 'approved' | 'declined' | 'pending') {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
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
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
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

function processTournamentFormData(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const prizeDistribution: { [key: string]: any } = {};
    const otherData: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(rawData)) {
        if (key.startsWith('prizeDistribution.')) {
            const prizeKey = key.split('.')[1];
            prizeDistribution[prizeKey] = value;
        } else {
            otherData[key] = value;
        }
    }
    return { ...otherData, prizeDistribution };
}

export async function createTournament(formData: FormData) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    
    const processedData = processTournamentFormData(formData);
    const validatedFields = tournamentSchema.safeParse(processedData);
    
    if (!validatedFields.success) {
        console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const { ...dataToSave } = validatedFields.data;
        await db.collection('tournaments').add({ ...dataToSave, leaderboard: [] });
        revalidatePath('/tournaments');
        revalidatePath('/admin/tournaments');
        return { success: true, message: 'Tournament created successfully.' };
    } catch (error) {
        console.error('Error creating tournament:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateTournament(id: string, formData: FormData) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    const processedData = processTournamentFormData(formData);
    const validatedFields = tournamentSchema.safeParse(processedData);
    
    if (!validatedFields.success) {
        console.log("Validation Errors:", validatedFields.error.flatten().fieldErrors);
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
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
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

export async function createStream(formData: FormData) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = streamSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid stream data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const embedUrl = transformToEmbedUrl(validatedFields.data.youtubeUrl);
    if (!embedUrl) {
        return { success: false, message: 'Invalid YouTube URL provided. Please use a standard YouTube video link.' };
    }

    try {
        await db.collection('streams').add({ 
            ...validatedFields.data,
            youtubeUrl: embedUrl,
            createdAt: new Date() 
        });
        revalidatePath('/streams');
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream created successfully.' };
    } catch (error) {
        console.error('Error creating stream:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateStream(id: string, formData: FormData) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = streamSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid stream data.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const embedUrl = transformToEmbedUrl(validatedFields.data.youtubeUrl);
    if (!embedUrl) {
        return { success: false, message: 'Invalid YouTube URL provided. Please use a standard YouTube video link.' };
    }


    try {
        await db.collection('streams').doc(id).update({
            ...validatedFields.data,
            youtubeUrl: embedUrl,
        });
        revalidatePath('/streams');
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream updated successfully.' };
    } catch (error) {
        console.error('Error updating stream:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteStream(id: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    if (!id) {
        return { success: false, message: 'Stream ID is required.' };
    }
    try {
        await db.collection('streams').doc(id).delete();
        revalidatePath('/streams');
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream deleted successfully.' };
    } catch (error) {
        console.error('Error deleting stream:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
