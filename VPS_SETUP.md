# VPS Setup Guide for Audiobook Generation App

This guide explains how to set up and configure your VPS to run the audiobook generation app with local AI models.

## Current VPS Information

**VPS IP:** `69.48.202.90`  
**Status:** ✅ Healthy (YouTube Downloader service running)

## Required VPS Endpoints for Audiobook App

You need to add these endpoints to your VPS alongside your existing YouTube downloader:

### 1. Text Generation Endpoint
```
POST http://69.48.202.90/ai/text/generate
```

**Request Format:**
```json
{
  "prompt": "Your summary prompt here...",
  "model": "gpt-oss-120b",
  "max_tokens": 300,
  "temperature": 0.7
}
```

**Expected Response:**
```json
{
  "success": true,
  "text": "Generated summary text...",
  "model_used": "gpt-oss-120b",
  "tokens_used": 250
}
```

### 2. Text-to-Speech Endpoint
```
POST http://69.48.202.90/ai/audio/tts
```

**Request Format:**
```json
{
  "text": "Text to convert to speech...",
  "model": "xtts-v2",
  "voice": "nova",
  "format": "mp3"
}
```

**Expected Response:**
```
Binary MP3 audio data (Content-Type: audio/mpeg)
```

### 3. AI Health Check Endpoint
```
GET http://69.48.202.90/ai/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "audiobook-ai-service",
  "models": {
    "text": "gpt-oss-120b",
    "tts": "xtts-v2"
  },
  "gpu_memory": "40GB",
  "uptime": "2h 30m"
}
```

## Recommended Models for VPS

### Text Generation Options:
1. **OpenAI gpt-oss-120b** (Recommended)
   - 117B parameters
   - Single 80GB GPU required
   - Apache 2.0 license (commercial use allowed)
   - Download: `huggingface.co/openai/gpt-oss-120b`

2. **OpenAI gpt-oss-20b** (Lighter option)
   - 21B parameters  
   - Only 16GB memory required
   - Great for edge deployment
   - Download: `huggingface.co/openai/gpt-oss-20b`

3. **Alternative: Llama 3.3 70B**
   - Meta's latest model
   - Good performance/efficiency balance

### Text-to-Speech Options:
1. **XTTS-v2 (Coqui)** (Recommended)
   - 17 languages supported
   - Voice cloning capabilities
   - <200ms latency
   - Download: `huggingface.co/coqui/XTTS-v2`

2. **Bark**
   - Natural voices + singing
   - Good quality but slower

## Environment Configuration

Update your `.env` file:

```bash
# Switch to VPS mode
AI_PROVIDER=vps

# VPS Configuration  
VPS_BASE_URL=http://69.48.202.90
VPS_TEXT_ENDPOINT=/ai/text/generate
VPS_TTS_ENDPOINT=/ai/audio/tts
VPS_API_KEY=your_vps_api_key_here

# Model preferences
VPS_TEXT_MODEL=gpt-oss-120b
VPS_TTS_MODEL=xtts-v2
VPS_VOICE=nova

# Keep OpenAI as fallback
OPENAI_API_KEY=your_openai_key_for_fallback
```

## VPS Implementation Steps

1. **Install Models on VPS**
   ```bash
   # Download models
   git clone https://huggingface.co/openai/gpt-oss-120b
   git clone https://huggingface.co/coqui/XTTS-v2
   ```

2. **Set up API Endpoints**
   - Create `/ai/text/generate` endpoint
   - Create `/ai/audio/tts` endpoint  
   - Create `/ai/health` endpoint

3. **Configure Hardware**
   - Ensure sufficient GPU memory for chosen model
   - Set up proper model loading and caching

4. **Test Endpoints**
   ```bash
   # Test text generation
   curl -X POST http://69.48.202.90/ai/text/generate \\
     -H "Content-Type: application/json" \\
     -d '{"prompt": "Test prompt", "model": "gpt-oss-120b"}'
   
   # Test TTS
   curl -X POST http://69.48.202.90/ai/audio/tts \\
     -H "Content-Type: application/json" \\
     -d '{"text": "Hello world", "voice": "nova"}' \\
     --output test.mp3
   ```

## Fallback Strategy

The app includes automatic fallback to OpenAI if VPS fails:

1. **Primary:** VPS endpoints (cost-effective)
2. **Fallback:** OpenAI API (reliable backup)

## Cost Comparison

**VPS (Local Models):**
- One-time setup cost
- No per-request charges
- Unlimited usage

**OpenAI (Current):**
- ~$0.03 per summary (GPT-4o-mini)
- ~$0.015 per audio minute (TTS-1-HD)
- For 23-page audiobook: ~$1-2 per generation

## Next Steps

1. Set up the AI endpoints on your VPS
2. Download and configure the chosen models
3. Update the audiobook app's `.env` to use VPS
4. Test the full pipeline
5. Deploy and monitor

## Support

The audiobook app will automatically detect VPS availability and fall back to OpenAI if needed. Check the health endpoint at `/api/audiobook/ai-health` for service status.