const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const router = express.Router();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post('/summarize', async (req, res) => {
  try {
    const { pageContent, pageNumber } = req.body;
    
    if (!pageContent) {
      return res.status(400).json({ error: 'Page content is required' });
    }

    const prompt = `You are a helpful assistant that creates concise, insightful summaries of text content. Focus on key points, main ideas, and important details. Keep summaries engaging and informative.

Please provide a concise summary of this page content (Page ${pageNumber}):

${pageContent}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 300,
        temperature: 0.7
      }
    });

    const summary = response.text;

    res.json({
      success: true,
      pageNumber,
      summary
    });

  } catch (error) {
    console.error('Gemini summarization error:', error.message);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

router.post('/summarize-batch', async (req, res) => {
  try {
    const { pages } = req.body;
    
    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({ error: 'Pages array is required' });
    }

    const summaries = [];
    const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests - much faster
    const MAX_RETRIES = 3;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      let retries = 0;
      let success = false;
      
      while (retries < MAX_RETRIES && !success) {
        try {
          console.log(`Processing page ${page.pageNumber} (${i + 1}/${pages.length}), attempt ${retries + 1}`);
          
          const prompt = `You are an expert at creating memorable, actionable summaries optimized for retention and understanding. Your goal is to help readers remember and apply the most important concepts.

**TASK:** Create a powerful summary for Page ${page.pageNumber} that follows this structure:

**📍 Page ${page.pageNumber} Key Insights:**

**🎯 Main Point:** [One clear sentence capturing the core message]

**💡 Key Takeaways:** [2-3 bullet points with specific, memorable insights]

**🧠 Remember This:** [One powerful quote, concept, or actionable insight that sticks]

**Content to Summarize:**
${page.content}`;

          const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              maxOutputTokens: 300,
              temperature: 0.7
            }
          });

          summaries.push({
            pageNumber: page.pageNumber,
            summary: response.text
          });
          
          success = true;
          console.log(`✅ Page ${page.pageNumber} summarized successfully`);

          // Rate limiting - wait between requests
          if (i < pages.length - 1) {
            console.log(`⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next request...`);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
          }
          
        } catch (error) {
          retries++;
          console.error(`❌ Error summarizing page ${page.pageNumber} (attempt ${retries}):`, error.message);
          
          if (error.message.includes('429') && retries < MAX_RETRIES) {
            // Rate limit hit, wait longer
            const waitTime = Math.min(60000, RATE_LIMIT_DELAY * retries * 2);
            console.log(`⏳ Rate limit hit, waiting ${waitTime/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else if (retries >= MAX_RETRIES) {
            summaries.push({
              pageNumber: page.pageNumber,
              summary: 'Summary generation failed after multiple attempts.',
              error: true
            });
          }
        }
      }
    }

    res.json({
      success: true,
      summaries,
      totalProcessed: summaries.length,
      successfulSummaries: summaries.filter(s => !s.error).length
    });

  } catch (error) {
    console.error('Batch Gemini summarization error:', error.message);
    res.status(500).json({
      error: 'Failed to generate summaries',
      details: error.message
    });
  }
});

module.exports = router;