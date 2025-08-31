export type StreamChunk = {
  targetId: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'hf' | 'ollama';
  model: string;
  type: 'text' | 'tool_call' | 'image';
  delta?: string;
  done?: boolean;
  usage?: { input: number; output: number };
  error?: string;
};
