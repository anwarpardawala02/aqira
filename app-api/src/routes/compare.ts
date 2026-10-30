import { FastifyInstance } from 'fastify';
import { callOpenAI, streamOpenAI } from '../adapters/openai';
import { callAnthropic } from '../adapters/anthropic';
import { callGemini } from '../adapters/gemini';
import { callGrok } from '../adapters/grok';
import { callDeepSeek } from '../adapters/deepseek';

// In-memory storage for job data (replace with Redis/DB in production)
const jobStore = new Map();

// For debugging - set timeout for job completion (15 seconds)
const JOB_TIMEOUT = 15000;

interface CompareRequest {
  prompt: string;
  models?: string[];
}

// Function to call the appropriate model adapter based on provider
async function callModelAPI(provider: string, prompt: string) {
  switch (provider) {
    case 'openai':
      return await callOpenAI(prompt);
    case 'anthropic':
      return await callAnthropic(prompt);
    case 'gemini':
      return await callGemini(prompt);
    case 'grok':
      return await callGrok(prompt);
    case 'deepseek':
      return await callDeepSeek(prompt);
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}

// Function to process job
async function processJob(jobId: string, prompt: string, models: string[]) {
  const jobData = jobStore.get(jobId);
  
  try {
    console.log(`Processing job ${jobId} with prompt: ${prompt}`);
    
    // Create a promise for each requested model
    const modelPromises = models.map(async (provider) => {
      try {
        const response = await callModelAPI(provider, prompt);
        return {
          model: response.model || provider,
          provider,
          output: response.output,
          completedAt: new Date()
        };
      } catch (error: any) {
        console.error(`Error calling ${provider}:`, error);
        return {
          model: provider,
          provider,
          output: `Error: ${error.message}`,
          error: true,
          completedAt: new Date()
        };
      }
    });
    
    // Wait for all promises to resolve
    const results = await Promise.all(modelPromises);
    
    // Add all results to the job data
    jobData.results = results;
    
    jobData.status = 'completed';
    console.log(`Job ${jobId} completed successfully with ${results.length} model results`);
  } catch (error: any) {
    console.error(`Error in job processing:`, error);
    jobData.status = 'error';
    jobData.error = error.message;
  }
}

export default async function compareRoutes(fastify: FastifyInstance) {
  // Post a new comparison job
  fastify.post('/v1/compare', async (request, reply) => {
    const { prompt, models = ['openai'] } = request.body as CompareRequest;
    
    if (!prompt) {
      reply.code(400);
      return { error: 'Prompt is required' };
    }
    
    const jobId = `job-${Date.now()}`;
    
    // Store job info
    jobStore.set(jobId, {
      prompt,
      models,
      status: 'processing',
      createdAt: new Date(),
      results: []
    });
    
    // Process in background (don't await)
    processJob(jobId, prompt, models).catch(error => {
      console.error(`Error processing job ${jobId}:`, error);
      jobStore.get(jobId).status = 'error';
      jobStore.get(jobId).error = error.message;
    });
    
    // Add a timeout to ensure job doesn't get stuck forever
    setTimeout(() => {
      const job = jobStore.get(jobId);
      if (job && job.status === 'processing') {
        console.log(`Job ${jobId} timed out after ${JOB_TIMEOUT}ms`);
        job.status = 'error';
        job.error = 'Job timed out after 15 seconds';
      }
    }, JOB_TIMEOUT);
    
    return {
      jobId,
      status: 'processing',
      message: 'Job accepted and being processed',
      streamUrl: `/v1/compare/${jobId}/stream`
    };
  });

  // Get job status
  fastify.get('/v1/compare/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    
    const job = jobStore.get(jobId);
    if (!job) {
      reply.code(404);
      return { error: 'Job not found' };
    }
    
    return {
      jobId,
      status: job.status,
      results: job.results,
      error: job.error
    };
  });

  // Stream job results via SSE
  fastify.get('/v1/compare/:jobId/stream', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    
    const job = jobStore.get(jobId);
    if (!job) {
      reply.code(404);
      return { error: 'Job not found' };
    }
    
    // Set headers for SSE with CORS
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });
    
    // Function to send SSE data
    const sendEvent = (data: any) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    // Send initial job state
    sendEvent({
      type: 'status',
      jobId,
      status: job.status,
    });
    
    try {
      // Send current job state - if it's already completed or errored out, use that data
      if (job.status === 'completed') {
        // If job is already completed, send all results immediately
        if (job.results.length > 0) {
          // Process all results
          job.results.forEach((result: {provider: string, model: string, output: string}) => {
            if (result) {
              sendEvent({
                type: 'chunk',
                provider: result.provider,
                model: result.model,
                content: result.output
              });
              
              sendEvent({
                type: 'done',
                provider: result.provider,
                model: result.model
              });
            }
          });
          
          // Send final all_done event
          sendEvent({
            type: 'all_done'
          });
          
          return reply;
        }
      } else if (job.status === 'error') {
        // If job errored out, send the error
        sendEvent({
          type: 'error',
          error: job.error || 'Unknown error occurred'
        });
        return reply;
      } else if (job.status === 'processing') {
        // Set up polling to check job status
        const maxPolls = 30; // 30 seconds timeout (30 * 1000ms)
        let pollCount = 0;
        
        const pollInterval = setInterval(() => {
          // Re-fetch job from store to get latest status
          const currentJob = jobStore.get(jobId);
          
          console.log(`Polling job ${jobId}, status: ${currentJob?.status}, poll count: ${pollCount}`);
          
          if (!currentJob) {
            clearInterval(pollInterval);
            sendEvent({
              type: 'error',
              error: 'Job no longer exists'
            });
            return;
          }
          
          // If job completed, send the result and end polling
          if (currentJob.status === 'completed') {
            clearInterval(pollInterval);
            
            // Process all results
            currentJob.results.forEach((result: {provider: string, model: string, output: string}) => {
              if (result) {
                // Map to the format the frontend expects
                const providerKey = `${result.provider}`;
                
                sendEvent({
                  type: 'chunk',
                  provider: result.provider,
                  model: result.model,
                  content: result.output
                });
                
                sendEvent({
                  type: 'done',
                  provider: result.provider,
                  model: result.model
                });
              }
            });
            
            // Final done event for all models
            sendEvent({
              type: 'all_done'
            });
            return;
          }
          
          // If job errored, send the error and end polling
          if (currentJob.status === 'error') {
            clearInterval(pollInterval);
            sendEvent({
              type: 'error',
              error: currentJob.error || 'Unknown error occurred'
            });
            return;
          }
          
          // Timeout check
          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            sendEvent({
              type: 'error',
              error: 'Streaming timeout after 30 seconds'
            });
            return;
          }
        }, 1000); // Poll every 1 second
        
        // Make sure to clear the interval when the connection closes
        request.raw.on('close', () => {
          clearInterval(pollInterval);
        });
      }
    } catch (error: any) {
      sendEvent({
        type: 'error',
        error: error.message
      });
    }
    
    // Close the connection when the request is closed
    request.raw.on('close', () => {
      reply.raw.end();
    });
  });
}
