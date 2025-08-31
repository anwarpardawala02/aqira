// For testing purposes only - this file can be deleted when real implementation is in place
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Multi-Model Comparator</h1>
      <p className="mb-8 text-gray-600">First Draft Version</p>
      
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Enter your prompt</label>
          <textarea 
            className="w-full border rounded p-2 h-32" 
            placeholder="Type your prompt here..."
          ></textarea>
        </div>
        
        <div className="mb-4">
          <h2 className="font-medium mb-2">Select Models</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded">OpenAI GPT-4</button>
            <button className="px-3 py-1 bg-gray-200 rounded">Anthropic Claude</button>
            <button className="px-3 py-1 bg-gray-200 rounded">Mistral</button>
          </div>
        </div>
        
        <button className="w-full bg-blue-600 text-white py-2 rounded font-medium">
          Compare Models
        </button>
      </div>
    </div>
  )
}
