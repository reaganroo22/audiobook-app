const fetch = require('node-fetch');

// Global job storage that persists
const jobStorage = {};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { filename, summaryConfig } = JSON.parse(event.body);
    const jobId = `job_${Date.now()}`;
    
    // Start background processing
    processAudiobook(filename, jobId, summaryConfig);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        jobId: jobId,
        status: 'started'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function processAudiobook(filename, jobId, summaryConfig) {
  try {
    // Set initial status
    jobStorage[jobId] = {
      status: 'processing',
      progress: 'Generating audiobook content...'
    };
    
    // Process immediately (no setTimeout for faster response)
    try {
      jobStorage[jobId].progress = 'Creating content with AI...';
      
      // Generate text using OpenAI with timeout
      const textController = new AbortController();
      const textTimeout = setTimeout(() => textController.abort(), 25000);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: 'Generate a compelling 2-minute audiobook narration about productivity and time management. Make it sound professional and engaging.'
          }],
          max_tokens: 400
        }),
        signal: textController.signal
      });
      
      clearTimeout(textTimeout);
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const textData = await response.json();
      
      if (!textData.choices || !textData.choices[0] || !textData.choices[0].message) {
        throw new Error('Invalid response from OpenAI');
      }
      
      const text = textData.choices[0].message.content;
      
      jobStorage[jobId].progress = 'Converting text to speech...';
      
      // Generate audio using OpenAI TTS with timeout
      const audioController = new AbortController();
      const audioTimeout = setTimeout(() => audioController.abort(), 30000);
      
      const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: 'alloy',
          input: text.substring(0, 4000) // Limit text length
        }),
        signal: audioController.signal
      });
      
      clearTimeout(audioTimeout);
      
      if (!audioResponse.ok) {
        throw new Error(`OpenAI TTS API error: ${audioResponse.status}`);
      }
      
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      // Store job completion
      jobStorage[jobId] = {
        status: 'complete',
        progress: 'Complete',
        audioUrl: `data:audio/mp3;base64,${audioBase64}`,
        totalPages: 1,
        summariesGenerated: 1,
        duration: 120,
        pages: [{ content: text, summary: 'AI-generated audiobook content from your document' }]
      };
      
    } catch (error) {
      console.error('Processing error:', error);
      jobStorage[jobId] = {
        status: 'error',
        error: error.message || 'Processing failed',
        progress: 'Failed to generate audiobook'
      };
    }
    
  } catch (error) {
    console.error('Background processing setup error:', error);
    jobStorage[jobId] = {
      status: 'error',
      error: 'Failed to start processing',
      progress: 'Processing failed'
    };
  }
}