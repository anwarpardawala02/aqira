import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Call Anthropic Claude API
 * @param prompt User prompt to send to Anthropic
 * @param model Anthropic model to use, defaults to claude-3-haiku
 * @returns Promise with provider and output text
 */
export async function callAnthropic(prompt: string, model: string = 'claude-3-haiku-20240307') {
  // Check if API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env file.');
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      provider: 'anthropic',
      model,
      output: response.content[0].type === 'text' ? response.content[0].text : '',
    };
  } catch (error: any) {
    console.error('Error calling Anthropic:', error);
    
    // Handle specific error cases
    if (error.status === 400 && error.message.includes('credit balance is too low')) {
      return {
        provider: 'anthropic',
        model,
        output: '⚠️ Anthropic API Error: Insufficient credits. Your Anthropic account needs more credits to use the API. Please visit https://console.anthropic.com/settings/billing to add credits.',
        error: true
      };
    }
    
    // Generic error handling
    return {
      provider: 'anthropic',
      model,
      output: `⚠️ Anthropic API Error: ${error.message || 'Unknown error occurred'}`,
      error: true
    };
  }
}

/**
 * Call Anthropic Claude API with streaming
 * @param prompt User prompt to send to Anthropic
 * @param model Anthropic model to use, defaults to claude-3-haiku
 * @returns Stream of Anthropic responses
 */
export async function streamAnthropic(prompt: string, model: string = 'claude-3-haiku-20240307') {
  // Check if API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env file.');
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    return {
      provider: 'anthropic',
      model,
      stream: response,
    };
  } catch (error: any) {
    console.error('Error streaming from Anthropic:', error);
    throw new Error(`Anthropic API streaming error: ${error.message}`);
  }
}
