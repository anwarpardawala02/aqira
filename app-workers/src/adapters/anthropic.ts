import { StreamChunk } from '../../../packages/shared/src/types';

export class AnthropicAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    prompt: string, 
    model: string = 'claude-3-sonnet',
    targetId: string = 'anthropic-default'
  ): Promise<StreamChunk[]> {
    // Implementation will be added once @anthropic-ai/sdk is installed
    const dummyChunk: StreamChunk = {
      targetId,
      provider: 'anthropic',
      model,
      type: 'text',
      delta: 'Anthropic adapter not yet implemented',
      done: true
    };
    
    return [dummyChunk];
  }
}
