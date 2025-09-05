const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const pdf2pic = require('pdf2pic');
const Tesseract = require('tesseract.js');
const router = express.Router();

router.post('/parse', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    
    try {
      // Try regular PDF text extraction first
      const pdfData = await pdfParse(dataBuffer);
      const fullText = pdfData.text;
      const totalPages = pdfData.numpages;
      
      // Check if we got meaningful text (not just whitespace)
      const meaningfulText = fullText.replace(/\s/g, '');
      
      console.log(`PDF analysis: ${meaningfulText.length} meaningful characters, ${fullText.length} total characters`);
      
      if (meaningfulText.length < 50) {
        // Text is too short, likely a scanned PDF
        console.log('PDF appears to be scanned, but OCR is disabled for stability');
        // For now, return what we have instead of OCR
        return res.json({
          success: true,
          totalPages,
          method: 'pdf-parse-minimal',
          extractedText: 'PDF appears to be scanned. OCR temporarily disabled.',
          pages: [{
            pageNumber: 1,
            content: fullText || 'Unable to extract text from this PDF. Please try a different PDF with selectable text.'
          }]
        });
      }
      
      // Debug: Show first 200 characters of extracted text
      console.log('First 200 chars:', fullText.substring(0, 200));
      
      // Split text by form feeds (page breaks) or estimate pages
      let pages = [];
      
      if (fullText.includes('\f')) {
        // Split by form feed characters (actual page breaks)
        pages = fullText.split('\f').filter(page => page.trim());
      } else {
        // Estimate pages by dividing text length
        const wordsPerPage = 250; // Typical words per page
        const words = fullText.split(/\s+/);
        const estimatedPageSize = Math.ceil(words.length / totalPages) || wordsPerPage;
        
        for (let i = 0; i < totalPages; i++) {
          const start = i * estimatedPageSize;
          const end = start + estimatedPageSize;
          const pageWords = words.slice(start, end);
          if (pageWords.length > 0) {
            pages.push(pageWords.join(' '));
          }
        }
      }
      
      // If we still don't have pages, create them by splitting text evenly
      if (pages.length === 0 && fullText.trim()) {
        const sentences = fullText.split(/[.!?]+/).filter(s => s.trim());
        const sentencesPerPage = Math.ceil(sentences.length / Math.max(totalPages, 1));
        
        for (let i = 0; i < Math.max(totalPages, 1); i++) {
          const start = i * sentencesPerPage;
          const end = start + sentencesPerPage;
          const pageSentences = sentences.slice(start, end);
          if (pageSentences.length > 0) {
            pages.push(pageSentences.join('. ').trim() + '.');
          }
        }
      }
      
      return res.json({
        success: true,
        totalPages,
        method: 'pdf-parse',
        extractedText: fullText.substring(0, 500) + '...',
        pages: pages.map((page, index) => ({
          pageNumber: index + 1,
          content: page.trim()
        }))
      });
      
    } catch (pdfParseError) {
      console.log('PDF text extraction failed:', pdfParseError.message);
      return res.status(500).json({
        error: 'PDF parsing failed',
        details: pdfParseError.message,
        suggestion: 'Please try a different PDF with selectable text'
      });
    }
  } catch (error) {
    console.error('PDF Parse error:', error.message);
    res.status(500).json({ 
      error: 'Failed to parse document',
      details: error.message
    });
  }
});

async function parseWithOCR(filePath, estimatedPages, res) {
  try {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const convert = pdf2pic.fromPath(filePath, {
      density: 300,           // High density for better OCR
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png',
      width: 2000,
      height: 2000
    });

    const pages = [];
    const maxPages = Math.min(estimatedPages, 20); // Limit to 20 pages for performance

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum} with OCR...`);
        
        const page = await convert(pageNum, { responseType: 'buffer' });
        const imagePath = page.path;
        
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
          logger: m => console.log(`OCR Progress: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
        });

        if (text.trim()) {
          pages.push({
            pageNumber: pageNum,
            content: text.trim()
          });
        }

        // Clean up temp image
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError.message);
        pages.push({
          pageNumber: pageNum,
          content: `[OCR failed for page ${pageNum}]`
        });
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return res.json({
      success: true,
      totalPages: pages.length,
      method: 'OCR',
      extractedText: pages.length > 0 ? pages[0].content.substring(0, 500) + '...' : 'No text extracted',
      pages
    });

  } catch (error) {
    console.error('OCR error:', error.message);
    return res.status(500).json({
      error: 'OCR processing failed',
      details: error.message
    });
  }
}

module.exports = router;