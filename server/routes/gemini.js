const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const wav = require('wav');
const fetch = require('node-fetch');
const router = express.Router();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function saveWaveFile(
  filename, 
  pcmData, 
  channels = 1, 
  rate = 24000, 
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    writer.on('finish', resolve);
    writer.on('error', reject);
    writer.write(pcmData);
    writer.end();
  });
}

router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, pageNumber, voiceName = 'Kore' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioFilename = `page_${pageNumber}_${Date.now()}.wav`;
    const audioPath = path.join(audioDir, audioFilename);

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ text }] 
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName
            },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error('No audio data received from Gemini');
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    await saveWaveFile(audioPath, audioBuffer);

    res.json({
      success: true,
      pageNumber,
      audioUrl: `/audio/${audioFilename}`,
      message: 'Audio generation completed'
    });

  } catch (error) {
    console.error('Gemini TTS error:', error.message);
    res.status(500).json({
      error: 'Failed to generate audio',
      details: error.message
    });
  }
});

router.post('/generate-audiobook', async (req, res) => {
  console.log('🎬 Starting batch audio generation...');
  
  try {
    const { pages } = req.body;
    
    if (!pages || !Array.isArray(pages)) {
      console.error('❌ Invalid pages data:', pages);
      return res.status(400).json({ error: 'Pages array is required' });
    }

    console.log(`📚 Processing ${pages.length} pages for audio generation`);
    const audioFiles = [];

    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Add process-level error handling to prevent crashes
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error);
    });

    // Send progress updates to client (if using WebSockets or Server-Sent Events)
    let completedPages = 0;
    
    for (const page of pages) {
      try {
        console.log(`🎵 Generating audio for page ${page.pageNumber}... (${completedPages + 1}/${pages.length})`);
        
        // Real progress tracking
        const progressPercent = Math.round(((completedPages) / pages.length) * 100);
        
        // Safety check for page data
        if (!page.content || page.content.trim().length === 0) {
          console.error(`❌ Page ${page.pageNumber} has no content, skipping`);
          audioFiles.push({
            pageNumber: page.pageNumber,
            error: true,
            message: 'Page has no content to convert to audio'
          });
          continue;
        }
        
        const summary = page.summary || 'No summary available';
        const fullText = `Page ${page.pageNumber}. ${page.content.substring(0, 1000)}. Page Summary: ${summary}`;
        
        console.log(`📝 Text length: ${fullText.length} characters`);
        
        const audioFilename = `page_${page.pageNumber}_${Date.now()}.wav`;
        const audioPath = path.join(audioDir, audioFilename);

        console.log('🔄 Calling Gemini TTS API...');
        
        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ 
            parts: [{ text: fullText }] 
          }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore'
                },
              },
            },
          },
        });

        console.log('✅ Gemini API response received');

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) {
          console.error('❌ No audio data in response:', JSON.stringify(response, null, 2));
          throw new Error('No audio data received from Gemini');
        }

        console.log(`💾 Converting audio data (${audioData.length} chars)...`);
        const audioBuffer = Buffer.from(audioData, 'base64');
        
        console.log('🎵 Saving audio file...');
        await saveWaveFile(audioPath, audioBuffer);
        
        console.log(`✅ Audio saved: ${audioFilename}`);

        audioFiles.push({
          pageNumber: page.pageNumber,
          audioUrl: `/audio/${audioFilename}`,
          duration: Math.ceil(fullText.length * 0.1)
        });

        completedPages++;
        const newProgressPercent = Math.round((completedPages / pages.length) * 100);
        console.log(`📈 Progress: ${completedPages}/${pages.length} (${newProgressPercent}%)`);

        // Wait between requests and force garbage collection
        await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2s
        if (global.gc) global.gc(); // Force garbage collection if available

      } catch (error) {
        console.error(`Error generating audio for page ${page.pageNumber}:`, error.message);
        audioFiles.push({
          pageNumber: page.pageNumber,
          error: true,
          message: 'Audio generation failed for this page'
        });
      }
    }

    res.json({
      success: true,
      audioFiles,
      totalPages: pages.length
    });

  } catch (error) {
    console.error('Batch audio generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate audiobook',
      details: error.message
    });
  }
});

// NEW: One-click PDF to complete audiobook workflow
router.post('/process-complete-audiobook', async (req, res) => {
  console.log('🚀 Starting complete audiobook processing...');
  
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Step 1: Parse PDF
    console.log('📄 Step 1: Parsing PDF...');
    const parseResponse = await fetch('http://localhost:3001/api/llama-parse/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const parseData = await parseResponse.json();
    
    if (!parseData.success) {
      throw new Error('PDF parsing failed');
    }

    const pages = parseData.pages;
    console.log(`✅ Parsed ${pages.length} pages`);

    // Step 2: Generate summaries
    console.log('🧠 Step 2: Generating summaries...');
    const summaryResponse = await fetch('http://localhost:3001/api/chatgpt/summarize-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages })
    });
    const summaryData = await summaryResponse.json();
    
    if (!summaryData.success) {
      throw new Error('Summary generation failed');
    }

    const summaries = summaryData.summaries;
    console.log(`✅ Generated ${summaries.length} summaries`);

    // Step 3: Create master audiobook script
    console.log('🎬 Step 3: Creating master audiobook script...');
    let masterScript = "Welcome to your audiobook. Let's begin.\n\n";
    
    // Add each page + its summary
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const summary = summaries.find(s => s.pageNumber === page.pageNumber);
      
      masterScript += `Page ${page.pageNumber}.\n\n${page.content}\n\n`;
      if (summary && !summary.error) {
        masterScript += `Page ${page.pageNumber} Summary:\n${summary.summary}\n\n`;
      }
    }

    // Add overall document summary
    const allContent = pages.map(p => p.content).join(' ');
    const overallSummaryPrompt = `Create a comprehensive summary of this entire document. Focus on the main themes, key insights, and overall message:\n\n${allContent.substring(0, 5000)}`;
    
    const overallSummaryResponse = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ parts: [{ text: overallSummaryPrompt }] }],
      config: { maxOutputTokens: 500, temperature: 0.7 }
    });

    const overallSummary = overallSummaryResponse.text;
    masterScript += `\n\nOverall Document Summary:\n${overallSummary}\n\nThank you for listening to your audiobook.`;

    // Step 4: Generate master audio file
    console.log('🎵 Step 4: Generating master audio file...');
    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const masterAudioFilename = `complete_audiobook_${Date.now()}.wav`;
    const masterAudioPath = path.join(audioDir, masterAudioFilename);

    const audioResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: masterScript }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error('No audio data received from Gemini');
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    await saveWaveFile(masterAudioPath, audioBuffer);

    console.log('✅ Complete audiobook generated successfully!');

    res.json({
      success: true,
      totalPages: pages.length,
      summariesGenerated: summaries.filter(s => !s.error).length,
      masterAudioUrl: `/audio/${masterAudioFilename}`,
      duration: Math.ceil(masterScript.length * 0.08), // Rough estimate
      message: 'Complete audiobook ready!'
    });

  } catch (error) {
    console.error('Complete audiobook generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate complete audiobook',
      details: error.message
    });
  }
});

module.exports = router;