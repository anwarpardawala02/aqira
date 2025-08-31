import React, { useState } from 'react';
import './PromptInput.css';

interface PromptInputProps {
  onSubmit: (prompt: string, systemPrompt?: string) => void;
  isLoading?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading = false }) => {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim(), systemPrompt.trim() || undefined);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {showSystemPrompt && (
          <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </label>
            <textarea
              id="system-prompt"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Optional system prompt..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
            />
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              User Prompt
            </label>
            <button
              type="button"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {showSystemPrompt ? 'Hide System Prompt' : 'Show System Prompt'}
            </button>
          </div>
          <textarea
            id="user-prompt"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Compare Models'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
