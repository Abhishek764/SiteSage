'use server';
/**
 * @fileOverview An AI agent to index the content of a website.
 *
 * - indexWebsiteContent - A function that handles the website content indexing process.
 * - IndexWebsiteContentInput - The input type for the indexWebsiteContent function.
 * - IndexWebsiteContentOutput - The return type for the indexWebsiteContent function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { crawlWebsite } from '@/services/crawler';

const IndexWebsiteContentInputSchema = z.object({
  websiteUrl: z.string().describe('The URL of the website to index.'),
});
export type IndexWebsiteContentInput = z.infer<typeof IndexWebsiteContentInputSchema>;

const IndexWebsiteContentOutputSchema = z.object({
  success: z.boolean().describe('Whether the website content was successfully indexed.'),
  message: z.string().describe('A message indicating the result of the indexing process.'),
  indexedContent: z.string().optional().describe('The indexed content of the website.'),
});
export type IndexWebsiteContentOutput = z.infer<typeof IndexWebsiteContentOutputSchema>;

export async function indexWebsiteContent(input: IndexWebsiteContentInput): Promise<IndexWebsiteContentOutput> {
  return indexWebsiteContentFlow(input);
}

const indexWebsiteContentPrompt = ai.definePrompt({
  name: 'indexWebsiteContentPrompt',
  input: {
    schema: z.object({
      websiteUrl: z.string().describe('The URL of the website to index.'),
    }),
  },
  output: {
    schema: z.object({
      success: z.boolean().describe('Whether the website content was successfully indexed.'),
      message: z.string().describe('A message indicating the result of the indexing process.'),
      indexedContent: z.string().optional().describe('The indexed content of the website.'),
    }),
  },
  prompt: `You are an expert AI agent specializing in indexing website content.\n\nYou will use the provided website URL to crawl and extract all relevant textual content for indexing.\n\nWebsite URL: {{{websiteUrl}}}\n\nConsider the website structure, content hierarchy, and identify key information to create a comprehensive index that will be used for question answering.\n\nEnsure that the indexed content is well-structured and easily searchable.`, // Ensure proper escaping of characters
});

const indexWebsiteContentFlow = ai.defineFlow<
  typeof IndexWebsiteContentInputSchema,
  typeof IndexWebsiteContentOutputSchema
>(
  {
    name: 'indexWebsiteContentFlow',
    inputSchema: IndexWebsiteContentInputSchema,
    outputSchema: IndexWebsiteContentOutputSchema,
  },
  async input => {
    try {
      const indexedContent = await crawlWebsite(input.websiteUrl);

      const {output} = await indexWebsiteContentPrompt({
        websiteUrl: input.websiteUrl,
      });

      return {
        success: true,
        message: 'Website content indexed successfully.',
        indexedContent: indexedContent,
      };
    } catch (error: any) {
      console.error('Error indexing website content:', error);
      return {
        success: false,
        message: `Failed to index website content: ${error.message}`,
      };
    }
  }
);
