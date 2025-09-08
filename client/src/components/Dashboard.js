import React, { useState } from 'react';
import PlayButton from './PlayButton';
import './Dashboard.css';

const PagePreview = ({ page, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="page-item">
      <div className="page-header" onClick={() => setExpanded(!expanded)}>
        <h4>Page {index + 1}</h4>
        <div className="page-meta">
          <span className="page-length">{page.content?.length || 0} chars</span>
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      
      <div className="page-summary">
        <strong>Summary:</strong>
        <p>{page.summary || 'No summary available'}</p>
      </div>
      
      {expanded && page.content && (
        <div className="page-content">
          <strong>Full Content:</strong>
          <div className="content-text">
            {page.content}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ onCreateNew, audiobooks = [], onUpdateAudiobook }) => {
  const [selectedAudiobook, setSelectedAudiobook] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'listened', 'unlistened'

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTitleEdit = (audiobook) => {
    setEditingTitle(audiobook.id);
    setTempTitle(audiobook.title);
  };

  const handleTitleSave = (audiobookId) => {
    if (onUpdateAudiobook && tempTitle.trim()) {
      onUpdateAudiobook(audiobookId, { title: tempTitle.trim() });
    }
    setEditingTitle(null);
    setTempTitle('');
  };

  const handleTitleCancel = () => {
    setEditingTitle(null);
    setTempTitle('');
  };

  const toggleListened = (audiobookId, event) => {
    event.stopPropagation();
    const audiobook = audiobooks.find(a => a.id === audiobookId);
    if (audiobook && onUpdateAudiobook) {
      onUpdateAudiobook(audiobookId, { listened: !audiobook.listened });
    }
  };

  const getFilteredAudiobooks = () => {
    switch (filter) {
      case 'listened':
        return audiobooks.filter(audiobook => audiobook.listened);
      case 'unlistened':
        return audiobooks.filter(audiobook => !audiobook.listened);
      default:
        return audiobooks;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Reading Stinks Library</h1>
          <p>Transform documents into intelligent audio experiences</p>
        </div>
        
        <div className="header-actions">
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({audiobooks.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'unlistened' ? 'active' : ''}`}
              onClick={() => setFilter('unlistened')}
            >
              Unlistened ({audiobooks.filter(a => !a.listened).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'listened' ? 'active' : ''}`}
              onClick={() => setFilter('listened')}
            >
              Listened ({audiobooks.filter(a => a.listened).length})
            </button>
          </div>
          
          <button className="create-new-btn" onClick={onCreateNew}>
            <span>Create New</span>
          </button>
        </div>
      </div>

      {audiobooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◯</div>
          <h2>No audiobooks</h2>
          <p>Upload your first document to begin</p>
          <button className="get-started-btn" onClick={onCreateNew}>
            Get Started
          </button>
        </div>
      ) : getFilteredAudiobooks().length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◯</div>
          <h2>No {filter} audiobooks</h2>
          <p>No audiobooks match the selected filter</p>
          <button className="filter-btn active" onClick={() => setFilter('all')}>
            Show All Documents
          </button>
        </div>
      ) : (
        <div className="audiobook-grid">
          {getFilteredAudiobooks().map((audiobook) => (
            <div 
              key={audiobook.id} 
              className="audiobook-card"
              onClick={() => setSelectedAudiobook(audiobook)}
            >
              <div className="card-header">
                <button 
                  className={`listened-indicator ${audiobook.listened ? 'listened' : 'unlistened'}`}
                  onClick={(e) => toggleListened(audiobook.id, e)}
                  title={audiobook.listened ? 'Mark as unlistened' : 'Mark as listened'}
                >
                  ●
                </button>
                <div className="card-info">
                  {editingTitle === audiobook.id ? (
                    <div className="title-edit-container">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="title-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTitleSave(audiobook.id);
                          } else if (e.key === 'Escape') {
                            handleTitleCancel();
                          }
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="title-edit-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleSave(audiobook.id);
                          }}
                          className="save-btn"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleCancel();
                          }}
                          className="cancel-btn"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="title-display-container">
                      <h3 onClick={(e) => {
                        e.stopPropagation();
                        handleTitleEdit(audiobook);
                      }}>{audiobook.title}</h3>
                      <button 
                        className="edit-title-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleEdit(audiobook);
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  <p className="card-meta">
                    {audiobook.totalPages} pages • {formatDuration(audiobook.duration)}
                  </p>
                  <p className="card-date">{formatDate(audiobook.created)}</p>
                </div>
              </div>
              
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-value">{audiobook.summariesGenerated}</span>
                  <span className="stat-label">Summaries</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{Math.ceil(audiobook.duration / 60)}m</span>
                  <span className="stat-label">Duration</span>
                </div>
              </div>

              <div className="card-actions">
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="play-button-container"
                >
                  <PlayButton 
                    audioSrc={`http://localhost:3001${audiobook.audioUrl}`}
                    size="medium"
                    variant="primary"
                  />
                </div>
                <button 
                  className="download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`http://localhost:3001${audiobook.audioUrl}`, '_blank');
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAudiobook && (
        <div className="audiobook-modal" onClick={() => setSelectedAudiobook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingTitle === selectedAudiobook.id ? (
                <div className="modal-title-edit-container">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="modal-title-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTitleSave(selectedAudiobook.id);
                      } else if (e.key === 'Escape') {
                        handleTitleCancel();
                      }
                    }}
                    autoFocus
                  />
                  <div className="modal-title-edit-actions">
                    <button 
                      onClick={() => handleTitleSave(selectedAudiobook.id)}
                      className="modal-save-btn"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleTitleCancel}
                      className="modal-cancel-btn"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modal-title-display">
                  <h2 onClick={() => handleTitleEdit(selectedAudiobook)}>{selectedAudiobook.title}</h2>
                  <button 
                    className="modal-edit-title-btn"
                    onClick={() => handleTitleEdit(selectedAudiobook)}
                  >
                    ✏️
                  </button>
                </div>
              )}
              <button 
                className="close-btn"
                onClick={() => setSelectedAudiobook(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="audiobook-player">
                <audio
                  controls
                  src={`http://localhost:3001${selectedAudiobook.audioUrl}`}
                  style={{ width: '100%', height: '60px' }}
                />
              </div>
              
              <div className="audiobook-details">
                <div className="detail-section">
                  <h3>Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{selectedAudiobook.totalPages}</span>
                      <span className="stat-text">Pages</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{selectedAudiobook.summariesGenerated}</span>
                      <span className="stat-text">Summaries</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{Math.ceil(selectedAudiobook.duration / 60)}</span>
                      <span className="stat-text">Minutes</span>
                    </div>
                  </div>
                </div>

                {selectedAudiobook.pages && selectedAudiobook.pages.length > 0 ? (
                  <div className="detail-section">
                    <h3>Content</h3>
                    <div className="pages-list">
                      {selectedAudiobook.pages.map((page, index) => (
                        <PagePreview 
                          key={index} 
                          page={page} 
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="detail-section">
                    <h3>Content</h3>
                    <div className="no-content-message">
                      <p>No content available. This audiobook was created before the content preview feature was added.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;