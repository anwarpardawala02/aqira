import { StreamChunk } from '../../../packages/shared/src/types';

export class MistralAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    prompt: string, 
    model: string = 'mistral-medium',
    targetId: string = 'mistral-default'
  ): Promise<StreamChunk[]> {
    // Implementation will be added once Mistral SDK is installed
    const dummyChunk: StreamChunk = {
      targetId,
      provider: 'mistral',
      model,
      type: 'text',
      delta: 'Mistral adapter not yet implemented',
      done: true
    };
    
    return [dummyChunk];
  }
}
