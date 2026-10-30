import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Call Google Gemini using Application Default Credentials (service account JSON via
 * GOOGLE_APPLICATION_CREDENTIALS) and the REST endpoint. Includes simple retry/backoff
 * for 429 rate-limit responses and returns a friendly error shape on failure.
 */
export async function callGemini(prompt: string, model: string = 'gemini-1.5-pro') {
  const url = `${GEMINI_BASE}/${model}:generateContent`;

  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

  console.log('🔑 Gemini adapter: Created GoogleAuth instance');
  console.log('🔑 GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  let accessToken: string | null = null;
  try {
    console.log('🔑 Gemini adapter: Getting auth client...');
    const client = await auth.getClient();
    console.log('🔑 Gemini adapter: Got client, getting access token...');
    const tokenResp = await client.getAccessToken();
    console.log('🔑 Gemini adapter: Got token response:', typeof tokenResp);
    accessToken = (tokenResp as any)?.token || (tokenResp as string) || null;
    console.log('🔑 Gemini adapter: Token obtained:', accessToken ? 'YES' : 'NO');
  } catch (err: any) {
    console.error('❌ Failed to obtain access token for Gemini:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return {
      provider: 'gemini',
      model,
      output: 'Error: failed to obtain Google access token. Check GOOGLE_APPLICATION_CREDENTIALS and service account permissions.',
      error: true
    };
  }

  const body = {
    prompt: { text: prompt },
    maxOutputTokens: 512
  };

  const maxRetries = 3;
  let attempt = 0;
  let backoff = 1000;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      console.log(`🔍 Gemini adapter: Attempt ${attempt} calling Gemini API`);
      const resp = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
      console.log(`✅ Gemini adapter: API call successful`); 

      const data = resp.data || {};

      // Try several possible response shapes that Google might return
      let text = '';
      if (Array.isArray(data.candidates) && data.candidates.length) {
        text = data.candidates.map((c: any) => {
          // candidate may have output.content or output[0].content or text
          if (c.output?.content) return c.output.content;
          if (Array.isArray(c.output) && c.output[0]?.content) return c.output[0].content;
          return c.output || c;
        }).join('\n');
      }

      if (!text && data.output) {
        if (typeof data.output === 'string') text = data.output;
        else if (Array.isArray(data.output) && data.output[0]?.content) text = data.output[0].content;
      }

      text = String(text || '').trim();

      return { provider: 'gemini', model, output: text };
    } catch (err: any) {
      const status = err?.response?.status;
      const bodyErr = err?.response?.data;

      // If rate limited, respect RetryInfo if present then backoff
      if (status === 429 && attempt <= maxRetries) {
        let retryMs = backoff;
        try {
          const details = bodyErr?.error?.details || bodyErr?.details || [];
          const retryInfo = (Array.isArray(details) && details.find((d: any) => d['@type']?.includes('RetryInfo')));
          const raw = retryInfo?.retryDelay || bodyErr?.retryDelay;
          if (raw && typeof raw === 'string') {
            const m = raw.match(/(\d+)s/);
            if (m) retryMs = parseInt(m[1], 10) * 1000;
          }
        } catch (_) {}

        await sleep(retryMs);
        backoff *= 2;
        continue;
      }

      const msg = bodyErr?.error?.message || err?.message || 'Gemini request failed';
      console.error('Gemini API error:', status, msg);
      return {
        provider: 'gemini',
        model,
        output: `Error: ${msg}`,
        error: true,
        code: status || 'unknown'
      };
    }
  }

  return {
    provider: 'gemini',
    model,
    output: 'Error: retry attempts exhausted (rate limited)',
    error: true
  };
}

/**
 * Streaming support is not implemented via REST in this adapter.
 * If you need streaming, switch to Google client library streaming APIs.
 */
export async function streamGemini(_: string, __: string = 'gemini-1.5-pro') {
  throw new Error('Streaming is not implemented in the ADC Gemini adapter.');
}
