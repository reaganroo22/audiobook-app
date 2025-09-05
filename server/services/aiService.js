const axios = require('axios');
const OpenAI = require('openai');

// AI Service abstraction layer
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.initializeServices();
  }

  initializeServices() {
    // OpenAI setup
    if (this.provider === 'openai' || !process.env.VPS_BASE_URL) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // VPS setup
    if (this.provider === 'vps' && process.env.VPS_BASE_URL) {
      this.vpsConfig = {
        baseURL: process.env.VPS_BASE_URL,
        textEndpoint: process.env.VPS_TEXT_ENDPOINT || '/ai/text/generate',
        ttsEndpoint: process.env.VPS_TTS_ENDPOINT || '/ai/audio/tts',
        apiKey: process.env.VPS_API_KEY,
        textModel: process.env.VPS_TEXT_MODEL || 'gpt-oss-120b',
        ttsModel: process.env.VPS_TTS_MODEL || 'xtts-v2',
        voice: process.env.VPS_VOICE || 'default'
      };
    }
  }

  // Generate text summary using configured provider
  async generateSummary(prompt, options = {}) {
    const maxTokens = options.maxTokens || 300;
    const temperature = options.temperature || 0.7;

    try {
      if (this.provider === 'vps' && this.vpsConfig) {
        return await this.generateSummaryVPS(prompt, maxTokens, temperature);
      } else {
        return await this.generateSummaryOpenAI(prompt, maxTokens, temperature);
      }
    } catch (error) {
      console.error(`❌ Summary generation failed with ${this.provider}:`, error.message);
      
      // Fallback to OpenAI if VPS fails
      if (this.provider === 'vps' && this.openai) {
        console.log('🔄 Falling back to OpenAI...');
        return await this.generateSummaryOpenAI(prompt, maxTokens, temperature);
      }
      
      throw error;
    }
  }

  // Generate audio using configured provider
  async generateAudio(text, options = {}) {
    const voice = options.voice || 'nova';
    const format = options.format || 'mp3';

    try {
      if (this.provider === 'vps' && this.vpsConfig) {
        return await this.generateAudioVPS(text, voice, format);
      } else {
        return await this.generateAudioOpenAI(text, voice, format);
      }
    } catch (error) {
      console.error(`❌ Audio generation failed with ${this.provider}:`, error.message);
      
      // Fallback to OpenAI if VPS fails
      if (this.provider === 'vps' && this.openai) {
        console.log('🔄 Falling back to OpenAI...');
        return await this.generateAudioOpenAI(text, voice, format);
      }
      
      throw error;
    }
  }

  // VPS Implementation
  async generateSummaryVPS(prompt, maxTokens, temperature) {
    const response = await axios.post(`${this.vpsConfig.baseURL}${this.vpsConfig.textEndpoint}`, {
      prompt: prompt,
      model: this.vpsConfig.textModel,
      max_tokens: maxTokens,
      temperature: temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.vpsConfig.apiKey && { 'Authorization': `Bearer ${this.vpsConfig.apiKey}` })
      },
      timeout: 120000 // 2 minute timeout
    });

    if (response.data.success) {
      return response.data.text || response.data.response || response.data.generated_text;
    } else {
      throw new Error(response.data.error || 'VPS text generation failed');
    }
  }

  async generateAudioVPS(text, voice, format) {
    const response = await axios.post(`${this.vpsConfig.baseURL}${this.vpsConfig.ttsEndpoint}`, {
      text: text,
      model: this.vpsConfig.ttsModel,
      voice: voice,
      format: format
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.vpsConfig.apiKey && { 'Authorization': `Bearer ${this.vpsConfig.apiKey}` })
      },
      responseType: 'arraybuffer', // Expect binary audio data
      timeout: 180000 // 3 minute timeout
    });

    // Return the audio buffer
    return Buffer.from(response.data);
  }

  // OpenAI Implementation
  async generateSummaryOpenAI(prompt, maxTokens, temperature) {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature
    });

    return response.choices[0].message.content;
  }

  async generateAudioOpenAI(text, voice, format) {
    const response = await this.openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1-hd',
      voice: voice,
      input: text,
      response_format: format
    });

    return Buffer.from(await response.arrayBuffer());
  }

  // Health check
  async healthCheck() {
    const status = {
      provider: this.provider,
      openai: !!this.openai,
      vps: !!this.vpsConfig
    };

    // Test VPS connection if configured
    if (this.vpsConfig) {
      try {
        const response = await axios.get(`${this.vpsConfig.baseURL}/health`, { timeout: 5000 });
        status.vpsHealth = response.data;
      } catch (error) {
        status.vpsHealth = { error: error.message };
      }
    }

    return status;
  }
}

module.exports = AIService;