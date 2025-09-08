import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import './AudiobookCreator.css';

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
    setProgress('Initializing audiobook creation...');
    
    try {
      // Use the first file for now (multi-document support can be added later)
      const filename = files[0].filename;
      
      // Start the audiobook creation job
      const startResponse = await axios.post('http://localhost:3001/api/audiobook/create', {
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

  const pollJobStatus = async (jobId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/audiobook/status/${jobId}`);
      const status = response.data;
      
      setProgress(status.progress || 'Processing...');
      
      if (status.status === 'complete') {
        setAudioUrl(status.audioUrl);
        setIsComplete(true);
        setProgress('Complete');
        
        // Auto-download the audiobook
        const downloadUrl = `http://localhost:3001${status.audioUrl}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `audiobook_${Date.now()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Prepare data for parent callback
        const audiobookData = {
          originalname: files[0].originalname,
          totalPages: status.totalPages || 1,
          summariesGenerated: status.summariesGenerated || 1,
          duration: status.duration || 300,
          audioUrl: status.audioUrl,
          pages: status.pages || []
        };
        
        // Call parent callback if provided
        if (onComplete) {
          onComplete(audiobookData);
        }
        
        setIsCreating(false);
      } else if (status.status === 'error') {
        setProgress(`Error: ${status.error}`);
        setIsCreating(false);
      } else {
        // Continue polling every 2 seconds
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      setProgress('Error checking status');
      setIsCreating(false);
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
            <div className="progress-details">
              <div className="progress-step">
                <span className="step-icon">📄</span>
                <span>Parsing PDF</span>
              </div>
              <div className="progress-step">
                <span className="step-icon">🧠</span>
                <span>AI Summarization</span>
              </div>
              <div className="progress-step">
                <span className="step-icon">🎵</span>
                <span>Audio Generation</span>
              </div>
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
              src={`http://localhost:3001${audioUrl}`}
            />
            
            <div className="complete-actions">
              <button 
                className="download-btn"
                onClick={() => window.open(`http://localhost:3001${audioUrl}`, '_blank')}
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