import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DocumentProcessor.css';

const DocumentProcessor = ({ file, onProcessComplete, isProcessing, setIsProcessing }) => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [detailedProgress, setDetailedProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (file && !isProcessing) {
      processDocument();
    }
  }, [file]);

  const processDocument = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Parse Document
      setStep(1);
      setProgress(10);
      setStatusMessage('Extracting text from PDF...');
      
      const parseResponse = await axios.post('http://localhost:3001/api/llama-parse/parse', {
        filename: file.filename
      });

      if (!parseResponse.data.success) {
        throw new Error('Failed to parse document');
      }

      const extractedPages = parseResponse.data.pages;
      setPages(extractedPages);
      setProgress(30);
      setStatusMessage(`Found ${extractedPages.length} pages. Starting summary generation...`);
      setDetailedProgress({ current: 0, total: extractedPages.length });
      
      // Step 2: Generate Summaries with Progress Updates
      setStep(2);
      
      // Start summary generation
      const summaryResponse = await axios.post('http://localhost:3001/api/chatgpt/summarize-batch', {
        pages: extractedPages
      });

      if (!summaryResponse.data.success) {
        throw new Error('Failed to generate summaries');
      }

      setSummaries(summaryResponse.data.summaries);
      setStep(3);
      setProgress(100);
      setStatusMessage(`Processing complete! Generated ${summaryResponse.data.successfulSummaries || summaryResponse.data.summaries.length} summaries.`);

      onProcessComplete({
        pages: extractedPages,
        summaries: summaryResponse.data.summaries
      });

    } catch (error) {
      console.error('Processing error:', error);
      setStatusMessage(`Error: ${error.message}`);
      alert('Failed to process document. Please check your API keys and try again.');
      setIsProcessing(false);
    }
  };

  const getStepDescription = () => {
    if (statusMessage) return statusMessage;
    
    switch (step) {
      case 1:
        return 'Extracting text from PDF...';
      case 2:
        return `Generating summaries... (${detailedProgress.current}/${detailedProgress.total})`;
      case 3:
        return 'Processing complete!';
      default:
        return 'Starting...';
    }
  };

  return (
    <div className="document-processor">
      <div className="processing-header">
        <h2>📋 Processing Document</h2>
        <p className="filename">{file.originalname}</p>
      </div>

      <div className="processing-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-text">Parse Document</span>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-text">Generate Summaries</span>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-text">Complete</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${progress === 100 ? 'completed' : ''}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="progress-text">{getStepDescription()}</p>
      </div>

      <div className="processing-results">
        {pages.length > 0 && (
          <div className="result-item">
            <p>✅ Parsed {pages.length} pages</p>
            <details className="page-preview">
              <summary>📖 Preview first page</summary>
              <div className="preview-content">
                <strong>Page 1:</strong>
                <p>{pages[0]?.content?.substring(0, 200)}...</p>
              </div>
            </details>
          </div>
        )}

        {summaries.length > 0 && (
          <div className="result-item">
            <p>✅ Generated {summaries.length} summaries</p>
            <p className="success-rate">
              {summaries.filter(s => !s.error).length} successful, {summaries.filter(s => s.error).length} failed
            </p>
          </div>
        )}

        {step === 2 && detailedProgress.total > 0 && (
          <div className="detailed-progress">
            <div className="progress-details">
              <span>Summary Progress: {detailedProgress.current}/{detailedProgress.total}</span>
              <div className="mini-progress-bar">
                <div 
                  className="mini-progress-fill" 
                  style={{ width: `${(detailedProgress.current / detailedProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentProcessor;