

'use server';

import { auth, db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { tournamentSchema, streamSchema, registrationSchema, type RegistrationData, leaderboardEntrySchema, siteSettingsSchema, profileSchema, finalistFormSchema, FinalistFormValues } from '@/lib/schemas';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { UserRecord } from 'firebase-admin/auth';

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
        const registrations = registrationsSnapshot.docs.map(doc => {
            const data = doc.data();
            if (!data) return null;
            return {
                id: doc.id,
                ...data,
                registeredAt: data.registeredAt?.toDate().toISOString() || new Date().toISOString(),
            };
        }).filter(Boolean); // Filter out any null entries
        return { success: true, data: registrations };
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return { success: false, data: [], message: 'Failed to fetch registrations.' };
    }
}


export async function updateRegistrationStatus(tournamentId: string, registrationId: string, status: 'approved' | 'declined' | 'pending', teamName: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    if (!tournamentId || !registrationId || !status) {
        return { success: false, message: 'Missing required parameters.' };
    }
    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const registrationRef = tournamentRef.collection('registrations').doc(registrationId);

        await db.runTransaction(async (transaction) => {
            const tournamentDoc = await transaction.get(tournamentRef);
            if (!tournamentDoc.exists) {
                throw new Error("Tournament not found!");
            }
            const tournamentData = tournamentDoc.data();
            let leaderboard = tournamentData?.leaderboard || [];
            
            // Update registration status
            transaction.update(registrationRef, { status });

            const leaderboardEntryExists = leaderboard.some((e: any) => e.teamName === teamName);

            if (status === 'approved' && !leaderboardEntryExists) {
                // Add to leaderboard if approved and not already there
                const newEntry = {
                    rank: 0,
                    teamName: teamName,
                    logoUrl: '',
                    points: 0,
                    matches: 0,
                    kills: 0,
                    chickenDinners: 0,
                };
                leaderboard.push(newEntry);
                transaction.update(tournamentRef, { leaderboard });
            } else if (status !== 'approved' && leaderboardEntryExists) {
                // Remove from leaderboard if not approved and is there
                const updatedLeaderboard = leaderboard.filter((e: any) => e.teamName !== teamName);
                transaction.update(tournamentRef, { leaderboard: updatedLeaderboard });
            }
        });

        revalidatePath(`/admin/tournaments/${tournamentId}`);
        revalidatePath(`/tournaments/${tournamentId}`);
        revalidatePath(`/admin/tournaments/${tournamentId}/leaderboard`);
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error('Error updating registration status:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateUserRole(userId: string, role: 'admin' | 'user' | 'moderator') {
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

export async function updateUserDisabledStatus(userId: string, disabled: boolean) {
    if (!auth) {
        return { success: false, message: 'Admin SDK not initialized.' };
    }
     if (!userId) {
        return { success: false, message: 'Missing user ID.' };
    }
    try {
        await auth.updateUser(userId, { disabled });
        revalidatePath('/admin/users');
        return { success: true, message: `User account has been ${disabled ? 'disabled' : 'enabled'}.` };
    } catch (error) {
        console.error('Error updating user disabled status:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteUser(userId: string) {
    if (!auth || !db) {
        return { success: false, message: 'Admin SDK not initialized.' };
    }
    if (!userId) {
        return { success: false, message: 'Missing user ID.' };
    }
    try {
        // Delete from Firebase Authentication
        await auth.deleteUser(userId);

        // Delete from Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.delete();

        revalidatePath('/admin/users');
        return { success: true, message: 'User has been permanently deleted.' };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        // Provide more specific error messages if possible
        if (error.code === 'auth/user-not-found') {
            return { success: false, message: 'User not found in Firebase Authentication.' };
        }
        return { success: false, message: 'An unexpected error occurred while deleting the user.' };
    }
}


function processTournamentFormData(formData: FormData) {
    const rawData: { [key: string]: any } = {};
    const prizeDistribution: { [key: string]: number } = {};

    for (const [key, value] of formData.entries()) {
        if (key.startsWith('prizeDistribution.')) {
            const prizeKey = key.split('.')[1];
            prizeDistribution[prizeKey] = Number(value);
        } else {
            rawData[key] = value;
        }
    }
    
    rawData.registrationOpen = formData.get('registrationOpen') === 'true';

    return { ...rawData, prizeDistribution };
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
        await db.collection('tournaments').add({ ...dataToSave, leaderboard: [], finalistLeaderboard: [], finalistLeaderboardActive: false });
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

export async function createOrUpdateLeaderboardEntry(tournamentId: string, data: any, originalTeamName?: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    
    const validatedFields = leaderboardEntrySchema.safeParse(data);
    if (!validatedFields.success) {
        console.error('Leaderboard validation error:', validatedFields.error.flatten().fieldErrors);
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const newEntry = validatedFields.data;
        
        const tournamentSnap = await tournamentRef.get();
        const tournamentData = tournamentSnap.data();
        const leaderboard = tournamentData?.leaderboard || [];

        const teamNameToUpdate = originalTeamName ? decodeURIComponent(originalTeamName) : newEntry.teamName;
        const entryIndex = leaderboard.findIndex((e: any) => e.teamName === teamNameToUpdate);

        if (entryIndex > -1) { // This is an update
            leaderboard[entryIndex] = newEntry;
        } else { // This is a create
            leaderboard.push(newEntry);
        }

        await tournamentRef.update({ leaderboard });

        revalidatePath(`/admin/tournaments/${tournamentId}/leaderboard`);
        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true, message: `Leaderboard entry ${entryIndex > -1 ? 'updated' : 'created'} successfully.` };
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteLeaderboardEntry(tournamentId: string, teamName: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const tournamentSnap = await tournamentRef.get();
        const tournamentData = tournamentSnap.data();
        let leaderboard = tournamentData?.leaderboard || [];
        
        const entryToDelete = leaderboard.find((e: any) => e.teamName === teamName);

        if(!entryToDelete) {
             return { success: false, message: 'Entry not found.' };
        }

        await tournamentRef.update({
            leaderboard: FieldValue.arrayRemove(entryToDelete)
        });

        revalidatePath(`/admin/tournaments/${tournamentId}/leaderboard`);
        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true, message: 'Leaderboard entry deleted successfully.' };
    } catch (error) {
        console.error('Error deleting leaderboard entry:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

function processSiteSettingsFormData(formData: FormData) {
    const rawData: { [key: string]: any } = { socialLinks: {} };
    const socialLinks: { [key: string]: string } = {};

    for (const [key, value] of formData.entries()) {
        if (key.startsWith('socialLinks.')) {
            const socialKey = key.split('.')[1];
            socialLinks[socialKey] = String(value);
        } else {
            rawData[key] = value;
        }
    }
    rawData.socialLinks = socialLinks;
    return rawData;
}


export async function updateSiteSettings(formData: FormData) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    
    const rawData = processSiteSettingsFormData(formData)
    const validatedFields = siteSettingsSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
        console.error(validatedFields.error.flatten().fieldErrors)
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.collection('settings').doc('siteSettings').set(validatedFields.data, { merge: true });
        revalidatePath('/');
        revalidatePath('/admin/settings');
        revalidatePath('/layout', 'layout'); // Revalidate layout to update header/footer
        return { success: true, message: 'Settings updated successfully.' };
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateUserProfile(userId: string, data: { displayName: string; bio: string; }) {
    if (!db || !auth) {
        return { success: false, message: 'Database not initialized.' };
    }

    const validatedFields = profileSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { displayName, bio } = validatedFields.data;

    try {
        // Update Firebase Auth profile
        await auth.updateUser(userId, { displayName });
        
        // Update Firestore document
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ displayName, bio });

        revalidatePath('/profile');
        return { success: true, message: 'Profile updated successfully.' };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function listAllUsers() {
    if (!db || !auth) {
        return { success: false, error: "Firebase Admin is not configured." };
    }

    try {
        const userRecords: UserRecord[] = [];
        let nextPageToken;
        // Batch fetch all users from Auth
        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            userRecords.push(...listUsersResult.users);
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        // Get all role data from Firestore
        const usersSnapshot = await db.collection('users').get();
        const rolesData = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data().role]));
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const users = userRecords.map(user => {
            const creationTime = new Date(user.metadata.creationTime);
            return {
                id: user.uid,
                displayName: user.displayName || 'N/A',
                email: user.email || 'N/A',
                disabled: user.disabled,
                emailVerified: user.emailVerified,
                role: rolesData.get(user.uid) || 'user',
                isNew: creationTime > sevenDaysAgo,
                createdAt: user.metadata.creationTime,
            };
        });

        return { success: true, users: users };

    } catch (e: any) {
        console.error("Error fetching all users:", e);
        return { success: false, error: `Failed to fetch user data: ${e.message}` };
    }
}

export async function updateFinalistLeaderboard(tournamentId: string, data: FinalistFormValues) {
    if (!db) {
        return { success: false, message: 'Database not initialized.' };
    }

    const validatedFields = finalistFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.collection('tournaments').doc(tournamentId).update(validatedFields.data);
        revalidatePath(`/tournaments/${tournamentId}`);
        revalidatePath(`/admin/tournaments/${tournamentId}/finalists`);
        return { success: true, message: 'Finalist leaderboard updated successfully.' };
    } catch (error) {
        console.error('Error updating finalist leaderboard:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateTeamGroup(tournamentId: string, teamName: string, newGroup: 'A' | 'B') {
    if (!db) {
        return { success: false, message: 'Database not initialized.' };
    }

    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        
        // Use dot notation to update a specific field in the 'groups' map
        const fieldToUpdate = `groups.${teamName}`;

        await tournamentRef.update({
            [fieldToUpdate]: newGroup
        });
        
        revalidatePath(`/admin/tournaments/${tournamentId}/leaderboard`);
        return { success: true, message: `Team ${teamName} moved to Group ${newGroup}.` };

    } catch (error) {
        console.error('Error updating team group:', error);
        return { success: false, message: 'An unexpected error occurred while updating the group.' };
    }
}

    