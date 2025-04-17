// 'use server'
'use server';

/**
 * @fileOverview A question answering AI agent for a specific website.
 *
 * - answerQuestionsFromWebsite - A function that handles the question answering process.
 * - AnswerQuestionsFromWebsiteInput - The input type for the answerQuestionsFromWebsite function.
 * - AnswerQuestionsFromWebsiteOutput - The return type for the answerQuestionsFromWebsite function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnswerQuestionsFromWebsiteInputSchema = z.object({
  websiteUrl: z.string().describe('The URL of the website to extract content from.'),
  question: z.string().describe('The question to answer based on the website content.'),
});
export type AnswerQuestionsFromWebsiteInput = z.infer<typeof AnswerQuestionsFromWebsiteInputSchema>;

const AnswerQuestionsFromWebsiteOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the website content.'),
  sourcePages: z.array(z.string()).describe('The source pages within the website used to answer the question.'),
});
export type AnswerQuestionsFromWebsiteOutput = z.infer<typeof AnswerQuestionsFromWebsiteOutputSchema>;


const websiteContentTool = ai.defineTool({
    name: 'getWebsiteContent',
    description: 'Retrieves content from a specific URL.  Use this to get content from the website to answer the question.',
    inputSchema: z.object({
        url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string().describe('The content of the URL.'),
    async execute(input) {
        // In a real implementation, this would fetch the content from the URL.
        // For this example, we'll just return a placeholder.
        return `Content from ${input.url}: [PLACEHOLDER CONTENT - IMPLEMENT WEBSCRAPING HERE]`;
    },
});

export async function answerQuestionsFromWebsite(input: AnswerQuestionsFromWebsiteInput): Promise<AnswerQuestionsFromWebsiteOutput> {
  return answerQuestionsFromWebsiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsFromWebsitePrompt',
  tools: [websiteContentTool],
  input: {
    schema: z.object({
      websiteUrl: z.string().describe('The URL of the website to extract content from.'),
      question: z.string().describe('The question to answer based on the website content.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The answer to the question based on the website content.'),
      sourcePages: z.array(z.string()).describe('The source pages within the website used to answer the question.'),
    }),
  },
  prompt: `You are an AI assistant that answers questions based solely on the content of a given website.

  Your task is to answer the following question: {{{question}}}

  using only the content from this website: {{{websiteUrl}}}.

  You may use the getWebsiteContent tool to retrieve content from specific pages of the website.

  If the answer cannot be found within the website, respond that you cannot answer the question using the available information.

  When providing an answer, cite the specific source pages within the website where you found the information.
`,
});

const answerQuestionsFromWebsiteFlow = ai.defineFlow<
  typeof AnswerQuestionsFromWebsiteInputSchema,
  typeof AnswerQuestionsFromWebsiteOutputSchema
>(
  {
    name: 'answerQuestionsFromWebsiteFlow',
    inputSchema: AnswerQuestionsFromWebsiteInputSchema,
    outputSchema: AnswerQuestionsFromWebsiteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
