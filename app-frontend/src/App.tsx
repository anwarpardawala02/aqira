import { useState } from 'react'
import PromptInput from './components/PromptInput/PromptInput'
import ModelPanel from './components/ModelPanel/ModelPanel'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<{
    [key: string]: {
      content: string;
      error?: string;
    }
  }>({});
  const [selectedModels, setSelectedModels] = useState({
    'openai-gpt-4': true,
    'anthropic-claude-3-opus': true,
    'mistral-medium': false
  });

  const handleSubmit = async (prompt: string, systemPrompt?: string) => {
    setIsLoading(true);
    
    // Clear previous responses
    setResponses({});
    
    // In a real app, this would call your backend API
    // For now, we'll simulate responses with a delay
    
    // Mock OpenAI response
    if (selectedModels['openai-gpt-4']) {
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          'openai-gpt-4': {
            content: `This is a simulated response from OpenAI GPT-4 for the prompt: "${prompt}"\n\nIn a real implementation, this would be streaming from the API.`
          }
        }));
      }, 1000);
    }
    
    // Mock Anthropic response
    if (selectedModels['anthropic-claude-3-opus']) {
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          'anthropic-claude-3-opus': {
            content: `This is a simulated response from Anthropic Claude 3 Opus for the prompt: "${prompt}"\n\nIn a real implementation, this would be streaming from the API.`
          }
        }));
      }, 1500);
    }
    
    // Mock Mistral response
    if (selectedModels['mistral-medium']) {
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          'mistral-medium': {
            content: `This is a simulated response from Mistral Medium for the prompt: "${prompt}"\n\nIn a real implementation, this would be streaming from the API.`
          }
        }));
      }, 800);
    }
    
    // Simulate end of loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Multi-Model Comparator</h1>
        <p className="text-gray-600 dark:text-gray-400">Compare responses from different AI models</p>
      </header>
      
      <div className="mb-6">
        <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Select Models</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => toggleModel('openai-gpt-4')} 
            className={`px-3 py-1 rounded-md ${selectedModels['openai-gpt-4'] ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            OpenAI GPT-4
          </button>
          <button 
            onClick={() => toggleModel('anthropic-claude-3-opus')} 
            className={`px-3 py-1 rounded-md ${selectedModels['anthropic-claude-3-opus'] ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Anthropic Claude 3
          </button>
          <button 
            onClick={() => toggleModel('mistral-medium')} 
            className={`px-3 py-1 rounded-md ${selectedModels['mistral-medium'] ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Mistral Medium
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {selectedModels['openai-gpt-4'] && (
          <ModelPanel 
            provider="openai" 
            model="gpt-4" 
            targetId="openai-gpt-4" 
            content={responses['openai-gpt-4']?.content || ''} 
            isLoading={isLoading && !responses['openai-gpt-4']} 
            error={responses['openai-gpt-4']?.error} 
          />
        )}
        
        {selectedModels['anthropic-claude-3-opus'] && (
          <ModelPanel 
            provider="anthropic" 
            model="claude-3-opus" 
            targetId="anthropic-claude-3-opus" 
            content={responses['anthropic-claude-3-opus']?.content || ''} 
            isLoading={isLoading && !responses['anthropic-claude-3-opus']} 
            error={responses['anthropic-claude-3-opus']?.error} 
          />
        )}
        
        {selectedModels['mistral-medium'] && (
          <ModelPanel 
            provider="mistral" 
            model="mistral-medium" 
            targetId="mistral-medium" 
            content={responses['mistral-medium']?.content || ''} 
            isLoading={isLoading && !responses['mistral-medium']} 
            error={responses['mistral-medium']?.error} 
          />
        )}
      </div>
      
      <footer className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
        Multi-Model Comparator - First Draft Version
      </footer>
    </div>
  );
}

export default App;
