
'use server';

import { auth, db, firebaseAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { tournamentSchema, streamSchema, registrationSchema, type RegistrationData, leaderboardEntrySchema, siteSettingsSchema, profileSchema, finalistFormSchema, type FinalistFormValues, newsSchema, NewsFormValues, photoSchema, PhotoFormValues } from '@/lib/schemas';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { UserRecord } from 'firebase-admin/auth';
import { z } from 'zod';
import { deterministicShuffle } from './utils';

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
      selected: false, // Default selected to false
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
        const registrationsSnapshot = await db.collection('tournaments').doc(tournamentId).collection('registrations').where('status', '==', 'approved').get();
        const registrations = registrationsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                teamName: data.teamName,
            };
        });
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

            const registrationDoc = await transaction.get(registrationRef);
            const registrationData = registrationDoc.data() || {};
            
            // Update registration status and ensure 'selected' field exists
            const updateData: { status: string, selected?: boolean } = { status };
            if (status === 'approved' && typeof registrationData.selected === 'undefined') {
                updateData.selected = false; // Set default value for 'selected' when approving for the first time
            }
            transaction.update(registrationRef, updateData);

            const leaderboardEntryExists = leaderboard.some((e: any) => e.teamName === teamName);

            if (status === 'approved' && !leaderboardEntryExists) {
                // Add to leaderboard if approved and not already there
                const newEntry = {
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

        // This action does not need to revalidate paths as the pages will be listening for real-time updates.
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error('Error updating registration status:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}


export async function updateLadderSelection(tournamentId: string, registrationId: string, selected: boolean) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    if (!tournamentId || !registrationId || typeof selected !== 'boolean') {
        return { success: false, message: 'Missing required parameters.' };
    }

    try {
        const registrationRef = db.collection('tournaments').doc(tournamentId).collection('registrations').doc(registrationId);
        await registrationRef.update({ selected });

        revalidatePath(`/ladder`); // Revalidate the public ladder page
        // No need to revalidate the admin page as it uses real-time listeners

        return { success: true, message: `Team selection updated.` };
    } catch (error) {
        console.error('Error updating ladder selection:', error);
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
        await auth.deleteUser(userId);
        const userRef = db.collection('users').doc(userId);
        await userRef.delete();
        revalidatePath('/admin/users');
        return { success: true, message: 'User has been permanently deleted.' };
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { success: false, message: 'User not found in Firebase Authentication.' };
        }
        return { success: false, message: 'An unexpected error occurred while deleting the user.' };
    }
}


export async function createTournament(data: z.infer<typeof tournamentSchema>) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    
    const validatedFields = tournamentSchema.safeParse(data);
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.collection('tournaments').add({
             ...validatedFields.data, 
             leaderboard: [],
             finalistLeaderboard: [],
             groups: {},
             groupsInitialized: false,
        });
        revalidatePath('/admin/tournaments');
        return { success: true, message: 'Tournament created successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateTournament(id: string, data: Partial<z.infer<typeof tournamentSchema>>) {
    if (!db) {
        return { success: false, message: 'Database not initialized.' };
    }
    const tournamentRef = db.collection('tournaments').doc(id);
    const tournamentSnap = await tournamentRef.get();
    if (!tournamentSnap.exists) {
        return { success: false, message: 'Tournament not found.' };
    }
    const existingData = tournamentSnap.data() || {};
    const dataToUpdate = { ...existingData, ...data };
    
    const validatedFields = tournamentSchema.safeParse(dataToUpdate);
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await tournamentRef.update(validatedFields.data);
        return { success: true, message: 'Tournament updated successfully.' };
    } catch (error) {
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
        await db.collection('tournaments').doc(id).delete();
        revalidatePath('/admin/tournaments');
        return { success: true, message: 'Tournament deleted successfully.' };
    } catch (error) {
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
        return { success: false, message: 'Invalid YouTube URL provided.' };
    }

    try {
        await db.collection('streams').add({ 
            ...validatedFields.data,
            youtubeUrl: embedUrl,
            createdAt: new Date() 
        });
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream created successfully.' };
    } catch (error) {
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
        return { success: false, message: 'Invalid stream data.' };
    }
    
    const embedUrl = transformToEmbedUrl(validatedFields.data.youtubeUrl);
    if (!embedUrl) {
        return { success: false, message: 'Invalid YouTube URL provided.' };
    }

    try {
        await db.collection('streams').doc(id).update({
            ...validatedFields.data,
            youtubeUrl: embedUrl,
        });
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteStream(id: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    try {
        await db.collection('streams').doc(id).delete();
        revalidatePath('/admin/streams');
        return { success: true, message: 'Stream deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function createOrUpdateLeaderboardEntry(tournamentId: string, data: any, originalTeamName?: string) {
    if (!db) {
      return { success: false, message: 'Database not initialized.' };
    }
    
    const validatedFields = leaderboardEntrySchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const newEntry = validatedFields.data;
        
        await db.runTransaction(async (transaction) => {
            const tournamentSnap = await transaction.get(tournamentRef);
            if (!tournamentSnap.exists) throw new Error("Tournament not found!");
            
            const tournamentData = tournamentSnap.data();
            const leaderboard = tournamentData?.leaderboard || [];
            const teamNameToUpdate = originalTeamName ? decodeURIComponent(originalTeamName) : newEntry.teamName;
            const entryIndex = leaderboard.findIndex((e: any) => e.teamName === teamNameToUpdate);

            if (entryIndex > -1) {
                const existingLogo = leaderboard[entryIndex].logoUrl;
                leaderboard[entryIndex] = { ...newEntry, logoUrl: newEntry.logoUrl || existingLogo };
            } else {
                leaderboard.push(newEntry);
            }
            transaction.update(tournamentRef, { leaderboard });
        });
        return { success: true, message: `Leaderboard entry updated successfully.` };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteLeaderboardEntry(tournamentId: string, teamName: string) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    
    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        await db.runTransaction(async (transaction) => {
            const tournamentSnap = await transaction.get(tournamentRef);
            if (!tournamentSnap.exists) throw new Error("Tournament not found!");
            const tournamentData = tournamentSnap.data();
            const leaderboard = tournamentData?.leaderboard || [];
            const updatedLeaderboard = leaderboard.filter((e: any) => e.teamName !== teamName);
            transaction.update(tournamentRef, { leaderboard: updatedLeaderboard });
        });
        return { success: true, message: 'Leaderboard entry deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateSiteSettings(formData: FormData) {
    if (!db) return { success: false, message: 'Database not initialized.' };

    const socialLinks: { [key: string]: string } = {};
    const rawData: { [key: string]: any } = { socialLinks };
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('socialLinks.')) {
            socialLinks[key.split('.')[1]] = String(value);
        } else {
            rawData[key] = value;
        }
    }
    
    const validatedFields = siteSettingsSchema.safeParse(rawData);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    try {
        await db.collection('settings').doc('siteSettings').set(validatedFields.data, { merge: true });
        revalidatePath('/');
        revalidatePath('/layout', 'layout');
        return { success: true, message: 'Settings updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateUserProfile(userId: string, data: { displayName: string; bio: string; }) {
    if (!db || !auth) return { success: false, message: 'Database not initialized.' };
    
    const validatedFields = profileSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    try {
        await auth.updateUser(userId, { displayName: data.displayName });
        await db.collection('users').doc(userId).update(data);
        revalidatePath('/profile');
        return { success: true, message: 'Profile updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateFinalistLeaderboard(tournamentId: string, data: FinalistFormValues) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    const validatedFields = finalistFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }
    try {
        await db.collection('tournaments').doc(tournamentId).update(validatedFields.data);
        return { success: true, message: 'Finalist leaderboard updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateTeamGroup(tournamentId: string, teamName: string, group: string | null) {
    if (!db || !firebaseAdmin) return { success: false, message: 'Database not initialized.' };
    
    try {
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const groupFieldPath = new firebaseAdmin.firestore.FieldPath('groups', teamName);

        const updateData: { [key: string]: any } = {
            groupsLastUpdated: FieldValue.serverTimestamp(),
        };

        if (group === null || group.trim() === '') {
            updateData[groupFieldPath.toString()] = FieldValue.delete();
        } else {
            updateData[groupFieldPath.toString()] = group;
        }
        await tournamentRef.update(updateData);
        // Do not revalidate here, as real-time listeners will handle the update.
        return { success: true, message: `Team ${teamName} assigned to ${group || 'Unassigned'}.` };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function listAllUsersWithVerification() {
    if (!db || !auth) return { error: "Firebase Admin is not configured." };
    
    try {
        const listUsersResult = await auth.listUsers();
        const usersSnapshot = await db.collection('users').get();
        const rolesData = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const users = listUsersResult.users.map(user => {
            const userData = rolesData.get(user.uid) || {};
            const creationTime = new Date(user.metadata.creationTime);
            return {
                id: user.uid,
                displayName: user.displayName || 'N/A',
                email: user.email || 'N/A',
                disabled: user.disabled,
                emailVerified: user.emailVerified,
                role: userData.role || 'user',
                isNew: userData.isNew === true && creationTime > sevenDaysAgo,
            };
        });

        return { users, success: true };
    } catch (error: any) {
        return { error: `Failed to list users: ${error.message}` };
    }
}

export async function createNews(data: NewsFormValues) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    const validatedFields = newsSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid news data.' };
    }
    try {
        await db.collection('news').add({ ...validatedFields.data, createdAt: new Date() });
        revalidatePath('/');
        revalidatePath('/admin/news');
        return { success: true, message: 'News item created successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updateNews(id: string, data: NewsFormValues) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    const validatedFields = newsSchema.safeParse(data);
    if (!validatedFields.success) return { success: false, message: 'Invalid news data.' };
    try {
        await db.collection('news').doc(id).update({ ...validatedFields.data });
        revalidatePath('/');
        revalidatePath('/admin/news');
        return { success: true, message: 'News item updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteNews(id: string) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    try {
        await db.collection('news').doc(id).delete();
        revalidatePath('/');
        revalidatePath('/admin/news');
        return { success: true, message: 'News item deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function manageTournamentGroups(tournamentId: string, reset: boolean = false) {
    if (!db || !firebaseAdmin) return { success: false, message: "Database not initialized." };

    const tournamentRef = db.collection('tournaments').doc(tournamentId);

    try {
        await db.runTransaction(async (transaction) => {
            const tournamentDoc = await transaction.get(tournamentRef);
            if (!tournamentDoc.exists) throw new Error("Tournament not found");

            const tournamentData = tournamentDoc.data()!;
            
            const registrationsSnapshot = await transaction.get(
                tournamentRef.collection('registrations').where('status', '==', 'approved')
            );
            const approvedTeams = registrationsSnapshot.docs.map(doc => doc.data().teamName);

            if (approvedTeams.length < 25 && !reset) {
                // Not enough teams for automatic grouping, do nothing unless it's a manual reset
                return;
            }
            
            let groups = tournamentData.groups || {};
            const alreadyGroupedTeams = Object.keys(groups);
            const newTeams = approvedTeams.filter(team => !alreadyGroupedTeams.includes(team));
            
            let teamsToGroup: string[];
            let groupCount: number;

            // Logic for initial group creation or reset
            if (reset || !tournamentData.groupsInitialized) {
                teamsToGroup = deterministicShuffle(approvedTeams, tournamentId);
                const baseGroupSize = 20;
                groupCount = Math.max(2, Math.ceil(teamsToGroup.length / baseGroupSize));
                groups = {}; // Reset groups
            } else { // Logic for adding new teams to existing groups
                teamsToGroup = deterministicShuffle(newTeams, tournamentId + 'new');
                const groupSizes = Object.values(groups).reduce((acc: any, groupName: any) => {
                    acc[groupName] = (acc[groupName] || 0) + 1;
                    return acc;
                }, {});
                groupCount = Object.keys(groupSizes).length || Math.max(2, Math.ceil(approvedTeams.length / 20));
            }
            
            if (teamsToGroup.length === 0) return;

            // Distribute teams into groups
            for (let i = 0; i < teamsToGroup.length; i++) {
                const team = teamsToGroup[i];
                const groupName = String.fromCharCode(65 + (i % groupCount)); // A, B, C...
                groups[team] = groupName;
            }

            // If we are adding new teams, rebalance by sorting groups by size and adding there
            if (!reset && tournamentData.groupsInitialized) {
                const sortedGroups = Object.keys(groups).sort((a,b) => {
                    const countA = Object.values(groups).filter(g => g === a).length;
                    const countB = Object.values(groups).filter(g => g === b).length;
                    return countA - countB;
                });
                for (let i = 0; i < teamsToGroup.length; i++) {
                    const team = teamsToGroup[i];
                    const groupName = sortedGroups[i % sortedGroups.length];
                    groups[team] = groupName;
                }
            }


            transaction.update(tournamentRef, {
                groups: groups,
                groupsInitialized: true,
                groupsLastUpdated: FieldValue.serverTimestamp()
            });
        });

        return { success: true, message: "Groups managed successfully." };
    } catch (error: any) {
        console.error("Error managing groups:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

export async function createPhoto(data: PhotoFormValues) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    const validatedFields = photoSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid photo data.' };
    }
    try {
        await db.collection('photos').add({ ...validatedFields.data, createdAt: new Date() });
        revalidatePath('/admin/photos');
        return { success: true, message: 'Photo added successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function updatePhoto(id: string, data: PhotoFormValues) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    const validatedFields = photoSchema.safeParse(data);
    if (!validatedFields.success) return { success: false, message: 'Invalid photo data.' };
    try {
        await db.collection('photos').doc(id).update({ ...validatedFields.data });
        revalidatePath('/admin/photos');
        return { success: true, message: 'Photo updated successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deletePhoto(id: string) {
    if (!db) return { success: false, message: 'Database not initialized.' };
    try {
        await db.collection('photos').doc(id).delete();
        revalidatePath('/admin/photos');
        return { success: true, message: 'Photo deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
