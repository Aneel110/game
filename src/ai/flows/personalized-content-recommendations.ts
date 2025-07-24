'use server';

/**
 * @fileOverview A personalized content recommendation AI agent.
 *
 * - personalizedContentRecommendations - A function that handles the content recommendation process.
 * - PersonalizedContentRecommendationsInput - The input type for the personalizedContentRecommendations function.
 * - PersonalizedContentRecommendationsOutput - The return type for the personalizedContentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile, including their interests and activity.'),
  contentList: z
    .string()
    .describe('A list of available content, such as news, strategies, and team recruitment forum posts.'),
});
export type PersonalizedContentRecommendationsInput = z.infer<
  typeof PersonalizedContentRecommendationsInputSchema
>;

const PersonalizedContentRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Personalized content recommendations based on the user profile.'),
});
export type PersonalizedContentRecommendationsOutput = z.infer<
  typeof PersonalizedContentRecommendationsOutputSchema
>;

export async function personalizedContentRecommendations(
  input: PersonalizedContentRecommendationsInput
): Promise<PersonalizedContentRecommendationsOutput> {
  return personalizedContentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentRecommendationsPrompt',
  input: {schema: PersonalizedContentRecommendationsInputSchema},
  output: {schema: PersonalizedContentRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized content recommendations to users.

  Based on the user's profile and activity, recommend relevant news, strategies, and team recruitment forum posts.

  User Profile: {{{userProfile}}}
  Content List: {{{contentList}}}

  Recommendations:`, // Removed the extraneous backticks here
});

const personalizedContentRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedContentRecommendationsFlow',
    inputSchema: PersonalizedContentRecommendationsInputSchema,
    outputSchema: PersonalizedContentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
