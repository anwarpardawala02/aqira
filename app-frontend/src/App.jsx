import { useState } from 'react'
import { useCompare } from './hooks/useCompare'

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState({
    'openai': true,
    'anthropic': false,
    'gemini': false,
    'grok': false,
    'deepseek': false
  });
  
  // Use the compare hook
  const { isLoading, responses, error, startComparison } = useCompare();

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const toggleModel = (model) => {
    setModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // Get selected models
    const selectedModels = Object.entries(models)
      .filter(([_, isSelected]) => isSelected)
      .map(([model]) => model);
      
    if (selectedModels.length === 0) {
      alert('Please select at least one model');
      return;
    }
    
    // Use the real API now with selected models
    startComparison(prompt, selectedModels);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-1">Multi-Model Comparator</h1>
        <p className="text-gray-600">First Draft Version</p>
      </header>
      
      <main className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Enter your prompt</label>
            <textarea 
              className="w-full border rounded p-3 h-32" 
              placeholder="Type your prompt here..."
              value={prompt}
              onChange={handlePromptChange}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <h2 className="font-medium mb-2">Select Models</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => toggleModel('openai')} 
                className={`px-3 py-1 rounded ${models.openai ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                OpenAI
              </button>
              <button 
                onClick={() => toggleModel('anthropic')} 
                className={`px-3 py-1 rounded ${models.anthropic ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Anthropic Claude
              </button>
              <button 
                onClick={() => toggleModel('gemini')} 
                className={`px-3 py-1 rounded ${models.gemini ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Google Gemini
              </button>
              <button 
                onClick={() => toggleModel('grok')} 
                className={`px-3 py-1 rounded ${models.grok ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                xAI Grok
              </button>
              <button 
                onClick={() => toggleModel('deepseek')} 
                className={`px-3 py-1 rounded ${models.deepseek ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                DeepSeek
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim() || !Object.values(models).some(Boolean)}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:bg-blue-300"
          >
            {isLoading ? 'Comparing...' : 'Compare Models'}
          </button>
        </div>
        
        {/* Response Grid */}
        {Object.keys(responses).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.openai && responses.openai && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">OpenAI</h3>
                </div>
                <div className="whitespace-pre-wrap">{responses.openai}</div>
              </div>
            )}
            
            {models.anthropic && responses.anthropic && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">Anthropic Claude</h3>
                </div>
                <div className="whitespace-pre-wrap">{responses.anthropic}</div>
              </div>
            )}
            
            {models.gemini && responses.gemini && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">Google Gemini</h3>
                </div>
                <div className="whitespace-pre-wrap">{responses.gemini}</div>
              </div>
            )}
            
            {models.grok && responses.grok && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">xAI Grok</h3>
                </div>
                <div className="whitespace-pre-wrap">{responses.grok}</div>
              </div>
            )}
            
            {models.deepseek && responses.deepseek && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">DeepSeek</h3>
                </div>
                <div className="whitespace-pre-wrap">{responses.deepseek}</div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        &copy; 2025 Multi-Model Comparator SaaS
      </footer>
    </div>
  )
}
