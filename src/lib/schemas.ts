
import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  date: z.string().min(1, 'Date is required.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  status: z.enum(['Upcoming', 'Ongoing', 'Finished']),
  mode: z.string().min(1, 'Mode is required.'),
  image: z.string().url('Image must be a valid URL.'),
  dataAiHint: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

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

export const streamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  youtubeUrl: z.string().refine(url => getYouTubeVideoId(url) !== null, {
    message: "Must be a valid YouTube video URL (e.g., youtube.com/watch?v=... or youtu.be/...)",
  }).transform((url, ctx) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      // This part of the code should ideally not be reached due to the .refine() check,
      // but it's here for type safety and as a fallback.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid YouTube URL provided.",
      });
      return z.NEVER;
    }
    // We only store the embed URL.
    return `https://www.youtube.com/embed/${videoId}`;
  }),
  status: z.enum(['Live', 'Upcoming', 'Past']),
});
