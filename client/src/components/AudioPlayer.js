import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AudioPlayer.css';

const AudioPlayer = ({ pages, summaries, audioFiles, filename, onAudioGenerated }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [showFullContent, setShowFullContent] = useState(false);
  const [viewMode, setViewMode] = useState('both'); // 'content', 'summary', 'both'
  const audioRef = useRef(null);

  const generateCompleteAudiobook = async () => {
    setIsGeneratingAudio(true);
    
    try {
      console.log('🚀 Starting complete audiobook generation...');
      
      const response = await axios.post('http://localhost:3001/api/gemini/process-complete-audiobook', {
        filename: filename
      });

      if (response.data.success) {
        console.log('✅ Complete audiobook generated:', response.data);
        
        // Create a single master audio file entry
        const masterAudioFile = [{
          pageNumber: 0,
          audioUrl: response.data.masterAudioUrl,
          duration: response.data.duration,
          isMasterAudio: true
        }];
        
        onAudioGenerated(masterAudioFile);
        setAudioGenerated(true);
      } else {
        throw new Error('Failed to generate complete audiobook');
      }
    } catch (error) {
      console.error('Complete audiobook generation error:', error);
      alert('Failed to generate audiobook. Please check your API keys and try again.');
    }
    setIsGeneratingAudio(false);
  };

  const generateAudiobook = async () => {
    setIsGeneratingAudio(true);
    setGenerationProgress({ current: 0, total: pages.length });
    
    try {
      const pagesWithSummaries = pages.map(page => {
        const summary = summaries.find(s => s.pageNumber === page.pageNumber);
        return {
          ...page,
          summary: summary?.summary || 'No summary available'
        };
      });

      // Simulate progress updates (in real app, you'd implement streaming or polling)
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev.current < prev.total) {
            return { ...prev, current: prev.current + 1 };
          }
          clearInterval(progressInterval);
          return prev;
        });
      }, 3000);

      const response = await axios.post('http://localhost:3001/api/gemini/generate-audiobook', {
        pages: pagesWithSummaries
      });

      clearInterval(progressInterval);
      
      if (response.data.success) {
        console.log('✅ Audio generation successful:', response.data);
        console.log('Audio files received:', response.data.audioFiles);
        onAudioGenerated(response.data.audioFiles);
        setAudioGenerated(true);
        setGenerationProgress({ current: pages.length, total: pages.length });
      } else {
        console.error('❌ Audio generation failed:', response.data);
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      alert('Failed to generate audiobook. Please check your Gemini API key and try again.');
    }
    setIsGeneratingAudio(false);
  };

  const playPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setIsPlaying(false);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [currentPage, playbackSpeed]);

  const currentSummary = summaries.find(s => s.pageNumber === pages[currentPage]?.pageNumber);
  const currentAudio = audioFiles.find(a => a.pageNumber === pages[currentPage]?.pageNumber);

  return (
    <div className="audio-player">
      <div className="audio-header">
        <div className="header-content">
          <h2>🎧 Audiobook Player</h2>
          <div className="header-stats">
            <span className="stat">{pages.length} pages</span>
            <span className="stat">{summaries.filter(s => !s.error).length} summaries</span>
            {audioGenerated && <span className="stat">✅ Audio ready</span>}
          </div>
        </div>
        
        {!audioGenerated && (
          <button
            className="generate-audio-btn primary-btn"
            onClick={generateCompleteAudiobook}
            disabled={isGeneratingAudio}
          >
            {isGeneratingAudio ? (
              <>
                <span className="spinner"></span>
                Creating Complete Audiobook...
              </>
            ) : (
              <>🎧 Create Complete Audiobook</>
            )}
          </button>
        )}
      </div>

      {isGeneratingAudio && (
        <div className="audio-generation">
          <div className="generation-header">
            <h3>🎤 Generating Audio with Gemini AI</h3>
            <p>This may take a few minutes. Each page is being converted to speech...</p>
          </div>
          <div className="generation-progress">
            <div className="progress-info">
              <span>Progress: {generationProgress.current} of {generationProgress.total} pages</span>
              <span>{generationProgress.total > 0 ? Math.round((generationProgress.current / generationProgress.total) * 100) : 0}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Always show page navigation */}
      <div className="page-navigation-container">
        <div className="page-navigation">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 0}
            className="nav-btn"
          >
            ⏮️ Previous
          </button>
          
          <span className="page-counter">
            Page {currentPage + 1} of {pages.length}
          </span>
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === pages.length - 1}
            className="nav-btn"
          >
            Next ⏭️
          </button>
        </div>
      </div>

      {/* Audio controls only show when audio is generated */}
      {audioGenerated && currentAudio && !currentAudio.error && (
        <div className="audio-controls">
          <div className="native-audio-player">
            <audio
              ref={audioRef}
              controls
              src={`http://localhost:3001${currentAudio.audioUrl}`}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => console.error('Audio error:', e)}
              style={{ width: '100%', height: '60px' }}
            />
          </div>
        </div>
      )}

      <div className="content-display">
        <div className="view-controls">
          <div className="view-mode-selector">
            <button 
              className={`view-btn ${viewMode === 'content' ? 'active' : ''}`}
              onClick={() => setViewMode('content')}
            >
              📄 Content Only
            </button>
            <button 
              className={`view-btn ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              📝 Summary Only
            </button>
            <button 
              className={`view-btn ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              📖 Both
            </button>
          </div>
          
          {(viewMode === 'content' || viewMode === 'both') && (
            <button 
              className="toggle-btn"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? '📖 Show Preview' : '📜 Show Full Text'}
            </button>
          )}
        </div>

        <div className="content-container">
          {(viewMode === 'content' || viewMode === 'both') && pages[currentPage] && (
            <div className="page-content">
              <div className="content-header">
                <h3>📄 Page {pages[currentPage].pageNumber}</h3>
                <span className="word-count">
                  {pages[currentPage].content.split(' ').length} words
                </span>
              </div>
              <div className="text-content">
                <p>
                  {showFullContent 
                    ? pages[currentPage].content 
                    : `${pages[currentPage].content.substring(0, 400)}...`
                  }
                </p>
              </div>
            </div>
          )}

          {(viewMode === 'summary' || viewMode === 'both') && currentSummary && (
            <div className="summary-content">
              <h3>📝 AI Summary</h3>
              {currentSummary.error ? (
                <div className="error-message">
                  <p>⚠️ Summary generation failed for this page</p>
                </div>
              ) : (
                <p>{currentSummary.summary}</p>
              )}
            </div>
          )}

          {currentAudio && currentAudio.error && (
            <div className="audio-error">
              <div className="error-message">
                <h4>⚠️ Audio Generation Failed</h4>
                <p>The audio could not be generated for this page. You can still read the content and summary above.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;