# 📚 Tesla x Apple Audiobook Generation System

Transform PDF documents into intelligent audiobooks with AI-powered summaries and high-quality text-to-speech. Features a sleek Tesla x Apple inspired design with support for both cloud and local AI models.

## ✨ Features

- **Multi-Document Upload** - Drag-and-drop with file reordering
- **AI-Powered Summaries** - Page-by-page intelligent summaries  
- **High-Quality Audio** - Professional TTS with multiple voices
- **Smart Configuration** - Adaptive summary intervals based on document length
- **Progress Tracking** - Real-time generation status with polling
- **Listened Status** - Track which audiobooks you've completed
- **Filter System** - Filter by listened/unlistened status
- **Editable Titles** - Click-to-edit audiobook titles
- **Native Audio Controls** - System-native HTML5 audio player
- **Auto-Download** - Completed audiobooks download automatically
- **Tesla x Apple UI** - Minimalist, professional design aesthetic

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd reading-audiobook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and preferences
   ```

4. **Start the application**
   ```bash
   # Option 1: Both services together
   npm run dev
   
   # Option 2: Separate terminals
   npm run server    # Backend on port 3001
   npm run client    # Frontend on port 3002
   ```

5. **Access the app**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001

## 🤖 AI Provider Options

### OpenAI (Cloud) - Plug & Play
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```
- **Pros:** Reliable, no setup required
- **Cons:** Cost per request (~$1-2 per audiobook)

### VPS (Local Models) - Cost Effective 
```bash
AI_PROVIDER=vps
VPS_BASE_URL=http://your-vps-ip
VPS_API_KEY=your_vps_key
```
- **Pros:** Unlimited usage, no per-request costs
- **Cons:** Requires VPS setup and model deployment
- **See:** [VPS_SETUP.md](./VPS_SETUP.md) for detailed instructions

## 📋 Recommended Models

### Text Generation
- **OpenAI gpt-oss-120b** (Best performance, Apache 2.0)
- **OpenAI gpt-oss-20b** (Efficient, edge-friendly)
- **Llama 3.3 70B** (Meta, solid alternative)

### Text-to-Speech
- **XTTS-v2** (17 languages, voice cloning, <200ms latency)
- **Bark** (Natural voices, singing support)
- **OpenAI TTS-1-HD** (Cloud fallback)

## 🛠 Configuration

### Environment Variables
```bash
# AI Service Provider
AI_PROVIDER=openai              # 'openai' or 'vps'

# OpenAI Configuration
OPENAI_API_KEY=sk-...           # Your OpenAI API key
OPENAI_TEXT_MODEL=gpt-4o-mini   # Text generation model
OPENAI_TTS_MODEL=tts-1-hd       # Audio generation model

# VPS Configuration  
VPS_BASE_URL=http://69.48.202.90    # Your VPS endpoint
VPS_TEXT_ENDPOINT=/ai/text/generate  # Text generation path
VPS_TTS_ENDPOINT=/ai/audio/tts       # TTS generation path
VPS_TEXT_MODEL=gpt-oss-120b          # Model to use on VPS
VPS_TTS_MODEL=xtts-v2                # TTS model on VPS

# Server Configuration
PORT=3001                       # Backend port
CLIENT_PORT=3002               # Frontend port
```

### Summary Configuration
- **Page Intervals:** 1, 2, 3, 5, 10 (adaptive based on document length)
- **Summary Styles:** Brief, Intelligent, Detailed
- **Full Document Summary:** Optional comprehensive overview

## 🏗 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│   Node.js API    │────│   AI Provider   │
│   (Port 3002)   │    │   (Port 3001)    │    │ (OpenAI or VPS) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Upload  │             │ PDF     │             │ Text    │
    │ Files   │             │ Parser  │             │ Gen     │
    └─────────┘             └─────────┘             └─────────┘
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Config  │             │ AI      │             │ Audio   │
    │ Summary │             │ Service │             │ Gen     │
    └─────────┘             └─────────┘             └─────────┘
```

## 📱 Usage

1. **Create New Audiobook**
   - Click "Create New" from dashboard
   - Upload PDF files (drag & drop supported)
   - Configure summary settings
   - Click "Generate Audiobook"

2. **Track Progress** 
   - Real-time status updates
   - Progress indicators for each step
   - Automatic download when complete

3. **Manage Library**
   - View all generated audiobooks
   - Click titles to edit them
   - Mark as listened/unlistened (green/gray dot)
   - Filter by listening status
   - Native audio controls for playback

## 🔧 API Endpoints

### Audiobook Generation
- `POST /api/audiobook/create` - Start generation job
- `GET /api/audiobook/status/:jobId` - Check job status
- `GET /api/audiobook/ai-health` - Check AI service health

### File Management
- `POST /api/upload` - Upload PDF files
- `GET /audio/:filename` - Download generated audio

## 🔄 Fallback Strategy

The system includes automatic fallback from VPS to OpenAI:

1. **Primary:** VPS endpoints (cost-effective, unlimited)
2. **Fallback:** OpenAI API (reliable, always available)
3. **Health Check:** Automatic service monitoring

## 📊 Cost Comparison

| Provider | Setup | Per Audiobook | Benefits |
|----------|-------|---------------|----------|
| OpenAI | None | $1-2 | Reliable, no setup |
| VPS | One-time | $0 | Unlimited, private |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check `/api/audiobook/ai-health` for service status
- Review logs for debugging information
- See [VPS_SETUP.md](./VPS_SETUP.md) for VPS configuration
- Open issues for bugs or feature requests

---

**Built with ❤️ for the future of intelligent audiobook generation**