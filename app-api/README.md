# Multi-Model Comparator API

Backend API service for the Multi-Model Comparator application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on the example:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3000 by default.

## API Endpoints

### Health Check
```
GET /health
```

### Compare AI Models
```
POST /v1/compare
```
Request body:
```json
{
  "prompt": "Your prompt here",
  "models": ["gpt-4o-mini"] // Optional, defaults to gpt-4o-mini
}
```

Response:
```json
{
  "jobId": "job-1234567890",
  "status": "processing",
  "message": "Job accepted and being processed",
  "streamUrl": "/v1/compare/job-1234567890/stream"
}
```

### Stream Results
```
GET /v1/compare/:jobId/stream
```

Returns a Server-Sent Events (SSE) stream with model responses.

## Example Usage

```bash
curl -X POST http://localhost:3000/v1/compare \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world"}'
```

## Future Enhancements

- Add Anthropic Claude adapter
- Add Mistral adapter
- Support for more configuration options
- Persistent storage for jobs
