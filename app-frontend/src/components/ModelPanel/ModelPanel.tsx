import React, { useEffect, useState } from 'react';
import './ModelPanel.css';
import { StreamChunk } from '../../../../packages/shared/src/types';

interface ModelPanelProps {
  provider: string;
  model: string;
  targetId: string;
  content?: string;
  isLoading?: boolean;
  error?: string;
  onSubscribeToStream?: (targetId: string, callback: (chunk: StreamChunk) => void) => () => void;
}

const ModelPanel: React.FC<ModelPanelProps> = ({
  provider,
  model,
  targetId,
  content = '',
  isLoading = false,
  error = '',
  onSubscribeToStream
}) => {
  const [streamedContent, setStreamedContent] = useState(content);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState('');
  
  // Subscribe to SSE stream when component mounts
  useEffect(() => {
    if (!onSubscribeToStream) return;
    
    setIsStreaming(true);
    setStreamedContent('');
    setStreamError('');
    
    const unsubscribe = onSubscribeToStream(targetId, (chunk) => {
      if (chunk.error) {
        setStreamError(chunk.error);
        setIsStreaming(false);
        return;
      }
      
      if (chunk.delta) {
        setStreamedContent(prev => prev + chunk.delta);
      }
      
      if (chunk.done) {
        setIsStreaming(false);
      }
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, [targetId, onSubscribeToStream]);
  
  const providerDisplayName = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'mistral': 'Mistral AI',
    'hf': 'Hugging Face',
    'ollama': 'Ollama'
  }[provider] || provider;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-800 dark:text-gray-200">{providerDisplayName}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{model}</span>
        </div>
        {(isLoading || isStreaming) && (
          <div className="flex items-center">
            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500 mr-1 animation-delay-200"></div>
            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500 animation-delay-400"></div>
          </div>
        )}
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto">
        {(error || streamError) && (
          <div className="text-red-500 mb-2">
            Error: {error || streamError}
          </div>
        )}
        
        <div className="whitespace-pre-wrap">
          {streamedContent || content || (isLoading && !isStreaming ? 'Loading...' : '')}
        </div>
      </div>
    </div>
  );
};

export default ModelPanel;
