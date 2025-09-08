const axios = require('axios');
const OpenAI = require('openai');
const { createClient } = require('@deepgram/sdk');

// AI Service abstraction layer
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.initializeServices();
    this.deepgramKeyIndex = 0; // For rotating between API keys
  }

  initializeServices() {
    // Always initialize OpenAI for text generation, regardless of primary provider
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI initialized for text generation');
    } else {
      console.log('⚠️ OpenAI API key not found - text generation may fail');
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

    // Deepgram setup
    if (this.provider === 'deepgram' || process.env.DEEPGRAM_API_KEY_1) {
      this.deepgramKeys = [
        process.env.DEEPGRAM_API_KEY_1,
        process.env.DEEPGRAM_API_KEY_2,
        process.env.DEEPGRAM_API_KEY_3,
        process.env.DEEPGRAM_API_KEY_4
      ].filter(key => key); // Remove undefined keys
      
      if (this.deepgramKeys.length > 0) {
        this.deepgram = createClient(this.deepgramKeys[0]);
        console.log(`✅ Deepgram initialized with ${this.deepgramKeys.length} API key(s)`);
      } else {
        console.log('⚠️ No Deepgram API keys found - will fall back to OpenAI for TTS');
      }
    }
  }

  // Generate text summary using configured provider
  async generateSummary(prompt, options = {}) {
    const maxTokens = options.maxTokens || 300;
    const temperature = options.temperature || 0.7;

    try {
      if (this.provider === 'vps' && this.vpsConfig) {
        return await this.generateSummaryVPS(prompt, maxTokens, temperature);
      } else if (this.openai) {
        return await this.generateSummaryOpenAI(prompt, maxTokens, temperature);
      } else {
        throw new Error('No text generation service available (OpenAI not initialized)');
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
      if (this.provider === 'deepgram' && this.deepgramKeys.length > 0) {
        return await this.generateAudioDeepgram(text, voice, format);
      } else if (this.provider === 'vps' && this.vpsConfig) {
        return await this.generateAudioVPS(text, voice, format);
      } else {
        return await this.generateAudioOpenAI(text, voice, format);
      }
    } catch (error) {
      console.error(`❌ Audio generation failed with ${this.provider}:`, error.message);
      
      // Fallback logic
      if (this.provider === 'deepgram' && this.openai) {
        console.log('🔄 Falling back from Deepgram to OpenAI...');
        return await this.generateAudioOpenAI(text, voice, format);
      } else if (this.provider === 'vps' && this.openai) {
        console.log('🔄 Falling back from VPS to OpenAI...');
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

  // Deepgram Aura TTS Implementation
  async generateAudioDeepgram(text, voice = 'aura-asteria-en', format = 'mp3') {
    try {
      // Use current API key
      const currentKey = this.deepgramKeys[this.deepgramKeyIndex];
      const deepgram = createClient(currentKey);
      
      console.log(`🎵 Using Deepgram API key ${this.deepgramKeyIndex + 1}/${this.deepgramKeys.length}`);
      
      // Deepgram supports: linear16, mulaw, alaw, mp3, opus, flac, aac
      const encoding = format === 'mp3' ? 'mp3' : 'linear16';
      
      const requestOptions = {
        model: 'aura-asteria-en', // High-quality voice
        encoding: encoding
      };
      
      // Only add sample_rate for non-mp3 formats
      if (encoding !== 'mp3') {
        requestOptions.sample_rate = 24000;
      }
      
      const response = await deepgram.speak.request({ text }, requestOptions);

      // Get the audio stream
      const stream = await response.getStream();
      if (!stream) {
        throw new Error('No audio stream received from Deepgram');
      }

      // Convert stream to buffer
      const chunks = [];
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
      
    } catch (error) {
      console.error(`❌ Deepgram TTS failed with key ${this.deepgramKeyIndex + 1}:`, error.message);
      
      // Try rotating to next API key if available
      if (this.deepgramKeys.length > 1 && this.deepgramKeyIndex < this.deepgramKeys.length - 1) {
        console.log(`🔄 Rotating to next Deepgram API key...`);
        this.deepgramKeyIndex++;
        return await this.generateAudioDeepgram(text, voice, format);
      }
      
      // Reset key index for next attempt
      this.deepgramKeyIndex = 0;
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    const status = {
      provider: this.provider,
      openai: !!this.openai,
      vps: !!this.vpsConfig,
      deepgram: {
        configured: this.deepgramKeys?.length > 0,
        keysAvailable: this.deepgramKeys?.length || 0,
        currentKeyIndex: this.deepgramKeyIndex
      }
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

    // Test Deepgram connection if configured
    if (this.deepgramKeys?.length > 0) {
      try {
        const deepgram = createClient(this.deepgramKeys[0]);
        // Test with a small text sample
        const testResponse = await deepgram.speak.request(
          { text: 'Test' },
          { model: 'aura-asteria-en', encoding: 'mp3' }
        );
        status.deepgramHealth = { status: 'connected', keys: this.deepgramKeys.length };
      } catch (error) {
        status.deepgramHealth = { error: error.message };
      }
    }

    return status;
  }
}

module.exports = AIService;