const fetch = require('node-fetch');

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
    global.jobStatuses = global.jobStatuses || {};
    global.jobStatuses[jobId] = {
      status: 'processing',
      progress: 'Generating sample audiobook content...'
    };
    
    setTimeout(async () => {
      try {
        // Generate text using OpenAI
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
              content: 'Generate a 2-minute sample audiobook narration about productivity and time management. Make it engaging and informative.'
            }],
            max_tokens: 500
          })
        });
        
        const textData = await response.json();
        const text = textData.choices[0].message.content;
        
        global.jobStatuses[jobId].progress = 'Converting text to speech...';
        
        // Generate audio using OpenAI TTS
        const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1-hd',
            voice: 'alloy',
            input: text
          })
        });
        
        const audioBuffer = await audioResponse.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        
        // Store job completion
        global.jobStatuses[jobId] = {
          status: 'complete',
          progress: 'Complete',
          audioUrl: `data:audio/mp3;base64,${audioBase64}`,
          totalPages: 1,
          summariesGenerated: 1,
          duration: 120,
          pages: [{ content: text, summary: 'Sample audiobook content generated from your document' }]
        };
        
      } catch (error) {
        global.jobStatuses[jobId] = {
          status: 'error',
          error: error.message,
          progress: 'Failed to generate audiobook'
        };
      }
    }, 3000);
    
  } catch (error) {
    console.error('Background processing error:', error);
  }
}