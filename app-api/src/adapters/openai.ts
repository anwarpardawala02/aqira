import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI Chat Completions API
 * @param prompt User prompt to send to OpenAI
 * @param model OpenAI model to use, defaults to gpt-4o-mini
 * @returns Promise with provider and output text
 */
export async function callOpenAI(prompt: string, model: string = 'gpt-4o-mini') {
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-')) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file with a valid OpenAI API key from https://platform.openai.com/account/api-keys');
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      provider: 'openai',
      model,
      output: response.choices[0]?.message.content || '',
    };
  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Call OpenAI Chat Completions API with streaming
 * @param prompt User prompt to send to OpenAI
 * @param model OpenAI model to use, defaults to gpt-4o-mini
 * @returns Stream of OpenAI responses
 */
export async function streamOpenAI(prompt: string, model: string = 'gpt-4o-mini') {
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-')) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file with a valid OpenAI API key from https://platform.openai.com/account/api-keys');
  }

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    return {
      provider: 'openai',
      model,
      stream,
    };
  } catch (error: any) {
    console.error('Error streaming from OpenAI:', error);
    throw new Error(`OpenAI API streaming error: ${error.message}`);
  }
}
