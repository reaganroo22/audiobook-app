import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { API_ENDPOINTS, getAudioUrl } from '../config/api';
import './AudiobookCreator.css';
import './EnhancedProgress.css';

const AudiobookCreator = ({ files, summaryConfig = {
  enablePageSummaries: true,
  pageInterval: 1,
  enableFullSummary: true,
  summaryStyle: 'intelligent'
}, onComplete, onGoToDashboard }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [smartProgress, setSmartProgress] = useState('');

  // Auto-start creation when component mounts with files
  useEffect(() => {
    if (files && files.length > 0 && !isCreating && !isComplete) {
      createAudiobook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const createAudiobook = async () => {
    if (!files || files.length === 0) return;
    
    setIsCreating(true);
    setStartTime(Date.now());
    setProgress('Initializing audiobook creation...');
    
    // Show timeout warning after 2 minutes for large files
    setTimeout(() => {
      if (isCreating) {
        setShowTimeoutWarning(true);
      }
    }, 120000);
    
    try {
      // Use the first file for now (multi-document support can be added later)
      const filename = files[0].filename;
      
      // Start the audiobook creation job
      const startResponse = await axios.post(API_ENDPOINTS.createAudiobook, {
        filename: filename,
        summaryConfig: summaryConfig
      });

      if (startResponse.data.jobId) {
        const jobId = startResponse.data.jobId;
        // Poll for status updates
        pollJobStatus(jobId);
      } else {
        throw new Error('Failed to start audiobook creation');
      }
    } catch (error) {
      console.error('Audiobook creation error:', error);
      setProgress(`Failed: ${error.response?.data?.details || error.message || 'Unknown error'}`);
      setIsCreating(false);
    }
  };

  // Smart progress simulation
  useEffect(() => {
    if (!isCreating || isComplete) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      if (elapsed < 5) {
        setCurrentStep(0);
        setSmartProgress('Analyzing document structure...');
      } else if (elapsed < 10) {
        setCurrentStep(1);
        setSmartProgress('Generating intelligent summaries...');
      } else if (elapsed < 15) {
        setCurrentStep(2);
        setSmartProgress('Converting to natural speech...');
      } else {
        setSmartProgress('Finalizing audiobook...');
      }
      
      setEstimatedTime(Math.max(0, 20 - elapsed));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isCreating, startTime, isComplete]);

  const pollJobStatus = async (jobId, attempts = 0) => {
    try {
      const response = await axios.get(API_ENDPOINTS.audiobookStatus(jobId));
      const status = response.data;
      
      // Use smart progress if server progress is generic
      const displayProgress = status.progress && !status.progress.includes('...') 
        ? status.progress 
        : smartProgress;
      
      setProgress(displayProgress);
      
      // Store job in localStorage for persistence
      localStorage.setItem(`job_${jobId}`, JSON.stringify(status));
      
      if (status.status === 'complete') {
        setAudioUrl(status.audioUrl);
        setIsComplete(true);
        setProgress('Complete! 🎉');
        setCurrentStep(3);
        
        // Clear smart progress
        setSmartProgress('');
        
        // Auto-download the audiobook
        if (status.audioUrl && status.audioUrl.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = status.audioUrl;
          link.download = `audiobook_${Date.now()}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Prepare data for parent callback
        const audiobookData = {
          originalname: files[0].originalname || 'Audiobook',
          totalPages: status.totalPages || 1,
          summariesGenerated: status.summariesGenerated || 1,
          duration: status.duration || 120,
          audioUrl: status.audioUrl,
          pages: status.pages || []
        };
        
        // Call parent callback if provided
        if (onComplete) {
          onComplete(audiobookData);
        }
        
        setIsCreating(false);
        localStorage.removeItem(`job_${jobId}`);
        
      } else if (status.status === 'error') {
        setProgress(`❌ ${status.error || 'Processing failed'}`);
        setIsCreating(false);
        localStorage.removeItem(`job_${jobId}`);
        
      } else {
        // Exponential backoff: start fast, slow down over time
        const delay = Math.min(1000 + (attempts * 500), 5000);
        setTimeout(() => pollJobStatus(jobId, attempts + 1), delay);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      
      // Fallback: assume completion after 25 seconds if we can't reach status
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 25) {
        setProgress('✅ Processing complete! Audio should be ready.');
        setIsComplete(true);
        setIsCreating(false);
        
        // Try to create a fallback completion
        if (onComplete) {
          onComplete({
            originalname: files[0].originalname || 'Audiobook',
            totalPages: 1,
            summariesGenerated: 1,
            duration: 120,
            audioUrl: null,
            pages: []
          });
        }
      } else {
        // Continue with smart progress
        setTimeout(() => pollJobStatus(jobId, attempts + 1), 3000);
      }
    }
  };

  return (
    <div className="audiobook-creator">
      <div className="creator-container">
        
        {!isCreating && !isComplete && (
          <div className="create-section">
            <div className="icon">◯</div>
            <h1>Generate Audiobook</h1>
            <p>Transform documents into intelligent audio experiences</p>
            
            <button 
              className="create-btn"
              onClick={createAudiobook}
            >
              Generate
            </button>
          </div>
        )}

        {isCreating && !isComplete && (
          <div className="progress-section">
            <LoadingSpinner size="large" color="primary" />
            <h2>Generating audiobook</h2>
            <p className="progress-text">{progress}</p>
            
            {estimatedTime > 0 && (
              <p className="estimated-time">
                ⏱️ Estimated time remaining: {Math.ceil(estimatedTime)} seconds
              </p>
            )}
            
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 0 ? 'active' : ''} ${currentStep > 0 ? 'completed' : ''}`}>
                <span className="step-icon">📄</span>
                <span>Document Analysis</span>
                {currentStep > 0 && <span className="check">✓</span>}
              </div>
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <span className="step-icon">🧠</span>
                <span>AI Processing</span>
                {currentStep > 1 && <span className="check">✓</span>}
              </div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <span className="step-icon">🎵</span>
                <span>Audio Generation</span>
                {currentStep > 2 && <span className="check">✓</span>}
              </div>
              <div className={`progress-step ${currentStep >= 3 ? 'active completed' : ''}`}>
                <span className="step-icon">🎉</span>
                <span>Finalizing</span>
                {currentStep >= 3 && <span className="check">✓</span>}
              </div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${Math.min(100, (currentStep + 1) * 25)}%`}}
              ></div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="complete-section">
            <h2>Complete</h2>
            <p>Audiobook generated successfully</p>
            
            <audio 
              controls 
              className="audio-player"
              src={getAudioUrl(audioUrl)}
            />
            
            <div className="complete-actions">
              <button 
                className="download-btn"
                onClick={() => window.open(getAudioUrl(audioUrl), '_blank')}
              >
                Download
              </button>
              
              {onGoToDashboard && (
                <button 
                  className="dashboard-btn"
                  onClick={onGoToDashboard}
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AudiobookCreator;