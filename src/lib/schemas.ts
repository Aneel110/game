
import { z } from 'zod';

export const leaderboardEntrySchema = z.object({
    rank: z.coerce.number().int().min(0, 'Rank must be a positive number or zero.').default(0),
    teamName: z.string().min(1, 'Team name is required.'),
    points: z.coerce.number().int().min(0, 'Points must be a positive number.').default(0),
    matches: z.coerce.number().int().min(0, 'Matches must be a positive number.').default(0),
    kills: z.coerce.number().int().min(0, 'Kills must be a positive number.').default(0),
    chickenDinners: z.coerce.number().int().min(0, 'Chicken Dinners must be a positive number.').default(0),
});

const prizeDistributionSchema = z.object({
  first: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
  second: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
  third: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
  fourth: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
  fifth: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
  topKills: z.coerce.number().min(0, 'Prize must be a positive number.').default(0),
});

export const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  date: z.string().min(1, 'Date is required.'),
  prizeDistribution: prizeDistributionSchema.default({}),
  mode: z.string().min(1, 'Mode is required.'),
  image: z.string().url('Image must be a valid URL.'),
  dataAiHint: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  rules: z.string().optional(),
  leaderboard: z.array(leaderboardEntrySchema).optional(),
});

export const streamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  youtubeUrl: z.string().url("Must be a valid YouTube URL."),
  status: z.enum(['Live', 'Upcoming', 'Past']),
});

const playerSchema = z.object({
  pubgName: z.string().min(1, 'Name is required.'),
  pubgId: z.string().min(1, 'ID is required.'),
  discordUsername: z.string().optional(),
});

export const registrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required."),
  teamTag: z.string().min(1, "Team tag is required."),
  players: z.array(playerSchema).min(4, 'You must register at least 4 players.').max(6, 'You can register a maximum of 6 players.'),
  registeredById: z.string().min(1),
  registeredByName: z.string().min(1),
});

const socialLinksSchema = z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    discord: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitch: z.string().url().optional().or(z.literal('')),
});

export const siteSettingsSchema = z.object({
    siteName: z.string().optional(),
    siteSlogan: z.string().optional(),
    homePageBackground: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
    socialLinks: socialLinksSchema.optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters long.'),
  bio: z.string().max(160, 'Bio must be less than 160 characters.').optional(),
});


export type RegistrationFormValues = z.infer<typeof registrationSchema>;
export type RegistrationData = RegistrationFormValues;
export type ProfileFormValues = z.infer<typeof profileSchema>;
