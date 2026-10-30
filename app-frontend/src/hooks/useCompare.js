import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:8000';

export function useCompare() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState(null);

  const startComparison = useCallback(async (prompt, selectedModels = ['openai']) => {
    setIsLoading(true);
    setError(null);
    setResponses({});

    try {
      // Submit comparison job with selected models
      const response = await fetch(`${API_URL}/v1/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          models: selectedModels
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setJobId(data.jobId);

      // Connect to SSE stream
      const eventSource = new EventSource(`${API_URL}${data.streamUrl}`);

      eventSource.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        console.log('SSE Event received:', eventData);
        
        if (eventData.type === 'chunk') {
          const { provider, model, content } = eventData;
          // In our case, just use the provider name as the key since we only have one model per provider for now
          const providerKey = provider;
          console.log('Adding content for:', providerKey);
          
          setResponses(prev => {
            const updated = {
              ...prev,
              [providerKey]: (prev[providerKey] || '') + content
            };
            console.log('Updated responses:', updated);
            return updated;
          });
        }
        
        if (eventData.type === 'done') {
          // Individual model has completed
          const { provider, model } = eventData;
          console.log(`${provider}-${model} has completed`);
        }
        
        if (eventData.type === 'all_done') {
          // All models have completed
          console.log('All models completed');
          setIsLoading(false);
          eventSource.close();
        }
        
        if (eventData.type === 'error') {
          setError(eventData.error);
          eventSource.close();
          setIsLoading(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
      };

      // Cleanup function to close the SSE connection
      return () => {
        eventSource.close();
        setIsLoading(false);
      };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    jobId,
    responses,
    error,
    startComparison
  };
}
