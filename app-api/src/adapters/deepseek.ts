import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API endpoint constants
const DEEPSEEK_API_ENDPOINT = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';

/**
 * Call DeepSeek API
 * @param prompt User prompt to send to DeepSeek
 * @param model DeepSeek model to use, defaults to deepseek-chat
 * @returns Promise with provider and output text
 */
export async function callDeepSeek(prompt: string, model: string = 'deepseek-chat') {
  // Check if API key is set
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in your .env file.');
  }

  try {
    const response = await axios.post(
      DEEPSEEK_API_ENDPOINT,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    return {
      provider: 'deepseek',
      model,
      output: response.data.choices[0]?.message?.content || '',
    };
  } catch (error: any) {
    console.error('Error calling DeepSeek:', error);
    throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Since DeepSeek's streaming API might not be directly compatible with the other implementations,
 * we'll handle it separately in the compare.ts route file when integrating this adapter.
 */
