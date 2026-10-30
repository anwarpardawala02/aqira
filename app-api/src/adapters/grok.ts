import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API endpoint constants
const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.grok.ai/v1/chat/completions';

/**
 * Call Grok API
 * @param prompt User prompt to send to Grok
 * @param model Model to use, defaults to grok-1
 * @returns Promise with provider and output text
 */
export async function callGrok(prompt: string, model: string = 'grok-1') {
  // Check if API key is set
  if (!process.env.GROK_API_KEY) {
    throw new Error('Grok API key not configured. Please set GROK_API_KEY in your .env file.');
  }

  try {
    const response = await axios.post(
      GROK_API_ENDPOINT,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`
        }
      }
    );

    return {
      provider: 'grok',
      model,
      output: response.data.choices[0]?.message?.content || '',
    };
  } catch (error: any) {
    console.error('Error calling Grok:', error);
    throw new Error(`Grok API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Since Grok's streaming API might not be directly compatible with the other implementations,
 * we'll handle it separately in the compare.ts route file when integrating this adapter.
 */
