const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const AIService = require('../services/aiService');
const router = express.Router();

// Initialize AI service
const aiService = new AIService();

async function saveWaveFile(filename, pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
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

// Status tracking
const jobStatus = {};

// SINGLE ENDPOINT: PDF → Complete Audiobook
router.post('/create', async (req, res) => {
  console.log('🚀 AUDIOBOOK CREATION STARTED');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📋 Headers:', req.headers);
  
  try {
    const { filename, summaryConfig = {} } = req.body;
    
    if (!filename) {
      console.error('❌ No filename provided in request');
      return res.status(400).json({ 
        error: 'Filename is required',
        received: req.body 
      });
    }
    
    console.log('📁 Processing file:', filename);
    console.log('⚙️ Summary config:', JSON.stringify(summaryConfig, null, 2));
    
    const jobId = `job_${Date.now()}`;
    
    // Initialize job status
    jobStatus[jobId] = {
      status: 'parsing',
      progress: 'Parsing PDF...',
      error: null,
      audioUrl: null
    };
    
    // Start processing in background
    processAudiobook(filename, jobId, summaryConfig);
    
    // Return job ID immediately
    res.json({
      jobId: jobId,
      status: 'started'
    });
    
  } catch (error) {
    console.error('💥 AUDIOBOOK CREATION FAILED:', error.message);
    res.status(500).json({
      error: 'Audiobook creation failed',
      details: error.message
    });
  }
});

// Status check endpoint
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  console.log(`🔍 Status check for job: ${jobId}`);
  
  const status = jobStatus[jobId];
  
  if (!status) {
    console.log(`❌ Job ${jobId} not found`);
    return res.status(404).json({ error: 'Job not found' });
  }
  
  console.log(`📊 Job ${jobId} status:`, JSON.stringify(status, null, 2));
  res.json(status);
});

// AI Service health check endpoint
router.get('/ai-health', async (req, res) => {
  try {
    const healthStatus = await aiService.healthCheck();
    res.json({
      success: true,
      ...healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function processAudiobook(filename, jobId, summaryConfig = {
  enablePageSummaries: true,
  pageInterval: 1,
  enableFullSummary: true,
  summaryStyle: 'intelligent',
  pageRange: 'all',
  startPage: 1,
  endPage: null,
  premiumAudio: false,
  generateFlashcards: false
}) {
  try {
    jobStatus[jobId].progress = 'Validating file...';
    
    if (!filename) {
      jobStatus[jobId].status = 'error';
      jobStatus[jobId].error = 'Filename required';
      return;
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      jobStatus[jobId].status = 'error';
      jobStatus[jobId].error = 'File not found';
      return;
    }

    // STEP 1: Parse PDF
    jobStatus[jobId].progress = 'Parsing PDF document...';
    console.log('📄 STEP 1: Parsing PDF...');
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    const fullText = pdfData.text;
    const totalPages = pdfData.numpages;
    
    // Smart page splitting
    let pages = [];
    if (fullText.includes('\f')) {
      pages = fullText.split('\f').filter(page => page.trim());
    } else {
      const words = fullText.split(/\s+/);
      const wordsPerPage = Math.ceil(words.length / totalPages) || 250;
      
      for (let i = 0; i < totalPages; i++) {
        const start = i * wordsPerPage;
        const end = start + wordsPerPage;
        const pageWords = words.slice(start, end);
        if (pageWords.length > 0) {
          pages.push(pageWords.join(' '));
        }
      }
    }
    
    // Extract config values BEFORE using them
    const {
      enablePageSummaries = true,
      pageInterval = 1,
      enableFullSummary = true,
      summaryStyle = 'intelligent',
      pageRange = 'all',
      startPage = 1,
      endPage = null,
      premiumAudio = false,
      generateFlashcards = false
    } = summaryConfig;
    
    // Apply page range filtering if specified
    if (pageRange === 'custom' && startPage && endPage) {
      const startIndex = Math.max(0, startPage - 1);
      const endIndex = Math.min(pages.length - 1, endPage - 1);
      pages = pages.slice(startIndex, endIndex + 1);
      console.log(`📄 Page range applied: pages ${startPage}-${endPage} (${pages.length} pages selected)`);
    }
    
    console.log(`✅ PARSED: ${pages.length} pages`);
    jobStatus[jobId].progress = `Parsed ${pages.length} pages successfully`;

    // STEP 2: Generate Summaries Based on Configuration
    jobStatus[jobId].status = 'summarizing';
    jobStatus[jobId].progress = 'Generating AI summaries...';
    console.log('🧠 STEP 2: Generating summaries...');

    const summaries = {};
    let pagesToSummarize = [];
    
    // Determine which pages to summarize based on configuration
    if (enablePageSummaries) {
      for (let i = 0; i < pages.length; i += pageInterval) {
        // For intervals > 1, combine pages
        if (pageInterval === 1) {
          pagesToSummarize.push({ index: i, content: pages[i], isGroup: false });
        } else {
          const groupContent = pages.slice(i, Math.min(i + pageInterval, pages.length)).join('\n\n');
          const endPage = Math.min(i + pageInterval - 1, pages.length - 1);
          pagesToSummarize.push({ 
            index: i, 
            endIndex: endPage,
            content: groupContent, 
            isGroup: true 
          });
        }
      }
    }

    // Generate page-by-page or grouped summaries
    for (let j = 0; j < pagesToSummarize.length; j++) {
      const pageData = pagesToSummarize[j];
      try {
        const pageLabel = pageData.isGroup 
          ? `pages ${pageData.index + 1}-${pageData.endIndex + 1}`
          : `page ${pageData.index + 1}`;
        
        jobStatus[jobId].progress = `Generating summary for ${pageLabel} (${j + 1}/${pagesToSummarize.length})...`;
        console.log(`📝 Summarizing ${pageLabel}...`);
        
        const stylePrompts = {
          brief: 'Create a brief, concise summary focusing only on the most essential points. Write in plain text without any markdown formatting, asterisks, or special characters.',
          intelligent: 'Create a balanced, intelligent summary with clear insights and key takeaways. Write in plain text without any markdown formatting, asterisks, or special characters.',
          detailed: 'Create a comprehensive, detailed summary covering all important aspects and nuances. Write in plain text without any markdown formatting, asterisks, or special characters.'
        };

        const prompt = `${stylePrompts[summaryStyle]}

Content to summarize:
${pageData.content}`;

        const summary = await aiService.generateSummary(prompt, {
          maxTokens: summaryStyle === 'detailed' ? 400 : summaryStyle === 'brief' ? 200 : 300,
          temperature: 0.7
        });

        // Store summary for each page in the group
        if (pageData.isGroup) {
          for (let k = pageData.index; k <= pageData.endIndex; k++) {
            summaries[k] = summary;
          }
        } else {
          summaries[pageData.index] = summary;
        }
        
        console.log(`✅ ${pageLabel.charAt(0).toUpperCase() + pageLabel.slice(1)} summarized`);
        
        // Rate limiting: 4 seconds between requests
        if (j < pagesToSummarize.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
        
      } catch (error) {
        const pageLabel = pageData.isGroup 
          ? `pages ${pageData.index + 1}-${pageData.endIndex + 1}`
          : `page ${pageData.index + 1}`;
        console.error(`❌ Error summarizing ${pageLabel}:`, error.message);
        
        if (pageData.isGroup) {
          for (let k = pageData.index; k <= pageData.endIndex; k++) {
            summaries[k] = 'Summary unavailable for this section.';
          }
        } else {
          summaries[pageData.index] = 'Summary unavailable for this page.';
        }
      }
    }

    // Generate full document summary if enabled
    if (enableFullSummary) {
      try {
        jobStatus[jobId].progress = 'Generating full document summary...';
        console.log('📖 Generating full document summary...');
        
        const fullPrompt = `Create a comprehensive summary of this entire document:

**Full Document Summary:**

🎯 **Overall Theme:** [Main theme/purpose]
💡 **Key Points:** [5-7 most important points]
🧠 **Core Insights:** [Essential takeaways]
📝 **Conclusion:** [Final thoughts/implications]

Full Document Content:
${pages.join('\n\n')}`;

        const fullSummary = await aiService.generateSummary(fullPrompt, {
          maxTokens: 500,
          temperature: 0.7
        });

        // Add full summary as index -1 or special identifier
        summaries.fullDocument = fullSummary;
        console.log('✅ Full document summary generated');
        
      } catch (error) {
        console.error('❌ Error generating full document summary:', error.message);
        summaries.fullDocument = 'Full document summary unavailable.';
      }
    }

    // Fill any missing page summaries with placeholder
    for (let i = 0; i < pages.length; i++) {
      if (!summaries[i]) {
        summaries[i] = 'No summary generated for this page.';
      }
    }
    
    console.log(`✅ SUMMARIES: ${Object.keys(summaries).length} generated`);
    console.log('📊 Summary debug - keys:', Object.keys(summaries));
    console.log('📊 Summary debug - sample content:', Object.keys(summaries).slice(0, 2).map(key => `${key}: ${summaries[key]?.substring(0, 100)}...`));

    // STEP 3: Create Master Audio Script
    console.log('🎬 STEP 3: Creating master audio script...');
    let masterScript = "Welcome to your personalized audiobook. Let's begin.\n\n";
    
    // Add each page + summary in sequence
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const summary = summaries[i];
      
      masterScript += `Page ${i + 1}.\n\n${page}\n\n`;
      if (summary && summary !== 'No summary generated for this page.') {
        masterScript += `Page ${i + 1} Summary.\n${summary}\n\n`;
      }
    }
    
    // Add full document summary if it was generated
    if (summaries.fullDocument) {
      masterScript += `\n\nComplete Document Summary.\n${summaries.fullDocument}\n\n`;
    }
    
    masterScript += `Thank you for listening to your audiobook. This completes your reading session.`;
    
    console.log(`✅ SCRIPT: ${masterScript.length} characters`);

    // STEP 4: Generate Audio using OpenAI TTS (Much more reliable)
    jobStatus[jobId].status = 'generating_audio';
    jobStatus[jobId].progress = 'Creating audio with OpenAI TTS...';
    console.log('🎵 STEP 4: Generating audio with OpenAI TTS...');
    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Determine chunk size based on AI provider
    // Deepgram has 2000 char limit, OpenAI has 4096 char limit
    const MAX_CHUNK_SIZE = aiService.provider === 'deepgram' ? 1800 : 4000; // Leave some buffer
    const chunks = [];
    
    // Split masterScript into chunks
    for (let i = 0; i < masterScript.length; i += MAX_CHUNK_SIZE) {
      chunks.push(masterScript.substring(i, i + MAX_CHUNK_SIZE));
    }
    
    jobStatus[jobId].progress = `Creating audio from ${chunks.length} chunks...`;
    console.log(`🔄 Processing ${chunks.length} audio chunks (${MAX_CHUNK_SIZE} char max per chunk)...`);
    
    const audioBuffers = [];
    for (let i = 0; i < chunks.length; i++) {
      jobStatus[jobId].progress = `Generating audio chunk ${i + 1} of ${chunks.length}...`;
      console.log(`🎤 Generating audio chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
      
      try {
        // Use premium audio (OpenAI TTS) or standard (Deepgram) based on config
        const audioOptions = {
          voice: premiumAudio ? "nova" : "aura-asteria-en",
          format: "mp3",
          premium: premiumAudio
        };
        
        const audioBuffer = await aiService.generateAudio(chunks[i], audioOptions);
        
        audioBuffers.push(audioBuffer);
        console.log(`✅ Chunk ${i + 1} audio generated successfully`);
        
        // Small delay to be respectful to API
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ OpenAI TTS failed for chunk ${i + 1}:`, error);
        throw new Error(`Failed to generate audio for chunk ${i + 1}: ${error.message}`);
      }
    }
    
    // Combine all MP3 audio buffers
    jobStatus[jobId].progress = 'Finalizing audiobook...';
    const combinedBuffer = Buffer.concat(audioBuffers);
    const audioFilename = `audiobook_${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    
    // Save the combined MP3 buffer directly
    fs.writeFileSync(audioPath, combinedBuffer);

    console.log('🎉 AUDIOBOOK COMPLETE!');

    // Generate flashcards if enabled
    let flashcards = [];
    if (generateFlashcards) {
      try {
        jobStatus[jobId].progress = 'Generating flashcards...';
        console.log('🎯 Generating flashcards from content...');
        
        // Combine all page summaries for flashcard generation (excluding fullDocument)
        const pageSummaries = [];
        for (let i = 0; i < pages.length; i++) {
          if (summaries[i] && summaries[i] !== 'No summary generated for this page.') {
            pageSummaries.push(summaries[i]);
          }
        }
        const contentForFlashcards = pageSummaries.join('\n\n');
        
        console.log(`📊 Flashcard debug: Found ${pageSummaries.length} page summaries, total content length: ${contentForFlashcards.length}`);
        console.log('📊 Available summaries keys:', Object.keys(summaries));
        
        if (contentForFlashcards.length > 0) {
          console.log('🎯 Starting flashcard generation with content...');
          flashcards = await aiService.generateFlashcards(contentForFlashcards, 15);
          console.log(`✅ Generated ${flashcards.length} flashcards`);
        } else {
          console.log('❌ No content available for flashcard generation - using all summaries as fallback');
          // Fallback: use all summaries including fullDocument
          const allContent = Object.values(summaries).filter(s => s && s.length > 0).join('\n\n');
          if (allContent.length > 0) {
            flashcards = await aiService.generateFlashcards(allContent, 15);
            console.log(`✅ Generated ${flashcards.length} flashcards from fallback content`);
          }
        }
      } catch (error) {
        console.error('❌ Error generating flashcards:', error.message);
        flashcards = [];
      }
    }

    // Mark as complete
    jobStatus[jobId].status = 'complete';
    jobStatus[jobId].progress = 'Audiobook ready!';
    jobStatus[jobId].audioUrl = `/audio/${audioFilename}`;
    jobStatus[jobId].totalPages = pages.length;
    jobStatus[jobId].summariesGenerated = Object.keys(summaries).filter(key => key !== 'fullDocument').length;
    jobStatus[jobId].pages = pages.map((page, index) => ({
      content: page,
      summary: summaries[index]
    }));
    jobStatus[jobId].fullDocumentSummary = summaries.fullDocument || null;
    jobStatus[jobId].flashcards = flashcards;
    jobStatus[jobId].duration = Math.floor(combinedBuffer.length / 16000); // Estimate duration

  } catch (error) {
    console.error('💥 AUDIOBOOK CREATION FAILED:', error.message);
    jobStatus[jobId].status = 'error';
    jobStatus[jobId].error = error.message;
  }
}

module.exports = router;