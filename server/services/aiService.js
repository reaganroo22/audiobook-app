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
    const premium = options.premium || false;

    try {
      // If premium audio is requested, always use GPT-4o-mini TTS
      if (premium) {
        console.log('🎵 Using premium audio (GPT-4o-mini TTS)');
        return await this.generateAudioOpenAI(text, voice, format, true);
      }
      
      // Standard audio should ONLY use Deepgram when premium is disabled
      if (this.provider === 'deepgram' && this.deepgramKeys.length > 0) {
        return await this.generateAudioDeepgram(text, voice, format);
      } else if (this.provider === 'vps' && this.vpsConfig) {
        return await this.generateAudioVPS(text, voice, format);
      } else {
        // If no Deepgram available and premium is OFF, throw error instead of fallback
        throw new Error('Standard audio requires Deepgram. Enable premium audio to use GPT-4o-mini TTS.');
      }
    } catch (error) {
      console.error(`❌ Audio generation failed with ${this.provider}:`, error.message);
      
      // Only fallback to OpenAI if premium audio is enabled
      if (premium) {
        console.log('🔄 Premium audio fallback to GPT-4o-mini TTS...');
        return await this.generateAudioOpenAI(text, voice, format, true);
      }
      
      // For standard audio, no fallback - throw the original error
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
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-mini', // Using GPT-5-mini for optimal cost/performance balance
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: maxTokens, // GPT-5-mini uses max_completion_tokens instead of max_tokens
        // temperature: temperature, // GPT-5-mini only supports default temperature (1)
        reasoning_effort: 'medium' // minimal, low, medium, high
      });
      
      // Clean markdown formatting from response
      let content = response.choices[0].message.content;
      content = content.replace(/\*\*/g, ''); // Remove bold markdown
      content = content.replace(/\*/g, ''); // Remove italic markdown  
      content = content.replace(/#{1,6}\s/g, ''); // Remove headers
      content = content.replace(/`/g, ''); // Remove code formatting
      return content;
      
    } catch (error) {
      console.error('GPT-5-mini error:', error.message);
      
      // Fallback to GPT-4 if GPT-5-mini fails
      console.log('🔄 Falling back to GPT-4...');
      const fallbackResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens, // GPT-4 uses max_tokens
        temperature: temperature
      });
      
      let content = fallbackResponse.choices[0].message.content;
      content = content.replace(/\*\*/g, '');
      content = content.replace(/\*/g, '');
      content = content.replace(/#{1,6}\s/g, '');
      content = content.replace(/`/g, '');
      return content;
    }
  }

  // Generate flashcards from content using GPT-5-mini
  async generateFlashcards(content, count = 10) {
    const prompt = `Generate exactly ${count} high-quality flashcards from this content. Create challenging but fair questions that test comprehension, analysis, and key concepts.

IMPORTANT: Respond with ONLY a valid JSON array. No explanations, no markdown, no text before or after. Just the JSON array.

Format: [{"question": "What is...", "answer": "The answer is..."}, {"question": "How does...", "answer": "It works by..."}]

Content to analyze:
${content.substring(0, 8000)}`; // Limit content to avoid token limits

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 2000,
        reasoning_effort: 'low'
      });

      let responseText = response.choices[0].message.content.trim();
      
      // Clean up the response to ensure it's valid JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      console.log(`🎯 Flashcard response preview: ${responseText.substring(0, 200)}...`);
      
      const flashcards = JSON.parse(responseText);
      return Array.isArray(flashcards) ? flashcards : [];
      
    } catch (error) {
      console.error('GPT-5-mini flashcard error:', error.message);
      
      // Fallback to GPT-4 for flashcard generation
      console.log('🔄 Falling back to GPT-4 for flashcards...');
      try {
        const fallbackResponse = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.3
        });
        
        let fallbackText = fallbackResponse.choices[0].message.content.trim();
        
        // Clean up the fallback response
        if (fallbackText.startsWith('```json')) {
          fallbackText = fallbackText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }
        if (fallbackText.startsWith('```')) {
          fallbackText = fallbackText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        const fallbackFlashcards = JSON.parse(fallbackText);
        return Array.isArray(fallbackFlashcards) ? fallbackFlashcards : [];
      } catch (fallbackError) {
        console.error('Error generating flashcards with fallback:', fallbackError);
        return [];
      }
    }
  }

  async generateAudioOpenAI(text, voice, format, premium = false) {
    // Map Deepgram voices to OpenAI voices
    const voiceMap = {
      'aura-asteria-en': 'alloy',
      'aura-luna-en': 'nova',
      'aura-stella-en': 'shimmer',
      'aura-athena-en': 'fable',
      'aura-hera-en': 'onyx',
      'aura-orion-en': 'echo'
    };
    
    const openaiVoice = voiceMap[voice] || voice || 'alloy';
    
    console.log(`🎵 OpenAI TTS: Generating audio with voice "${openaiVoice}"`);
    
    console.log(`🎵 Using ${premium ? 'Premium GPT-4o-mini-tts' : 'Standard OpenAI TTS'}`);
    
    let response;
    if (premium) {
      // Use GPT-4o Mini TTS API with its specific parameters
      console.log(`🎵 GPT-4o-mini-tts: voice_style="${openaiVoice}", format="${format}"`);
      response = await this.openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        input: text.substring(0, 2000), // GPT-4o-mini-tts has 2000 token limit
        language: "en",
        voice_style: "friendly assistant",
        output_format: format,
        speed: 1.0,
        voice_instructions: `Use a ${openaiVoice} style voice with clear, natural pronunciation.`
      });
    } else {
      // Use standard OpenAI TTS
      const ttsModel = process.env.OPENAI_TTS_MODEL || 'tts-1';
      console.log(`🎵 Standard TTS model: ${ttsModel}, voice: ${openaiVoice}`);
      response = await this.openai.audio.speech.create({
        model: ttsModel,
        voice: openaiVoice,
        input: text.substring(0, 4000), // OpenAI standard TTS has 4000 char limit
        response_format: format
      });
    }

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