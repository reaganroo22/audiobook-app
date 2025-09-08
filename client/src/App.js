import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/Login';
import Dashboard from './components/Dashboard';
import MultiFileUpload from './components/MultiFileUpload';
import AudiobookCreator from './components/AudiobookCreator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Support from './components/Support';
import './App.css';

// Main App Content (when authenticated)
function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'upload', 'creating'
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [summaryConfig, setSummaryConfig] = useState(null);
  const [audiobooks, setAudiobooks] = useState([]);
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Load audiobooks from localStorage
    const saved = localStorage.getItem('audiobooks');
    if (saved) {
      setAudiobooks(JSON.parse(saved));
    }
  }, []);

  const saveAudiobook = (audiobookData) => {
    const newAudiobook = {
      id: Date.now(),
      title: audiobookData.originalname || `Audiobook ${Date.now()}`,
      created: Date.now(),
      totalPages: audiobookData.totalPages || 1,
      summariesGenerated: audiobookData.summariesGenerated || 1,
      duration: audiobookData.duration || 300,
      audioUrl: audiobookData.audioUrl,
      pages: audiobookData.pages || [],
      listened: false
    };

    const updatedAudiobooks = [...audiobooks, newAudiobook];
    setAudiobooks(updatedAudiobooks);
    localStorage.setItem('audiobooks', JSON.stringify(updatedAudiobooks));
  };

  const updateAudiobook = (audiobookId, updates) => {
    const updatedAudiobooks = audiobooks.map(audiobook => 
      audiobook.id === audiobookId 
        ? { ...audiobook, ...updates }
        : audiobook
    );
    setAudiobooks(updatedAudiobooks);
    localStorage.setItem('audiobooks', JSON.stringify(updatedAudiobooks));
  };

  const handleFilesUpload = (files, config) => {
    setUploadedFiles(files);
    setSummaryConfig(config);
    setCurrentView('creating');
  };

  const handleAudiobookComplete = (result) => {
    saveAudiobook(result);
    setCurrentView('dashboard');
    setUploadedFiles(null);
  };

  const resetToUpload = () => {
    setCurrentView('upload');
    setUploadedFiles(null);
    setSummaryConfig(null);
  };

  const resetToDashboard = () => {
    setCurrentView('dashboard');
    setUploadedFiles(null);
    setSummaryConfig(null);
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-brand">
          <svg width="32" height="32" viewBox="0 0 72 72" fill="none" className="header-logo">
            <rect width="72" height="72" rx="16" fill="url(#headerGradient)"/>
            <rect x="18" y="20" width="32" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
            <rect x="20" y="26" width="28" height="4" rx="2" fill="rgba(255,255,255,0.6)"/>
            <rect x="22" y="32" width="24" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
            <path d="M52 36c0-4-2-7-5-7s-5 3-5 7 2 7 5 7 5-3 5-7z" fill="#00D9FF" opacity="0.8"/>
            <circle cx="58" cy="14" r="4" fill="#FF3B30"/>
            <defs>
              <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1C1C1E"/>
                <stop offset="100%" stopColor="#2C2C2E"/>
              </linearGradient>
            </defs>
          </svg>
          <h1>Audiobook</h1>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="User" />
            ) : (
              <div className="user-initial">
                {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.user_metadata?.full_name || 'Student'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      </div>

      {currentView === 'dashboard' && (
        <Dashboard 
          audiobooks={audiobooks}
          onCreateNew={() => setCurrentView('upload')}
          onUpdateAudiobook={updateAudiobook}
        />
      )}
      
      {currentView === 'upload' && (
        <div className="upload-screen">
          <div className="navigation">
            <button className="back-btn" onClick={resetToDashboard}>
              ← Back to Dashboard
            </button>
          </div>
          <MultiFileUpload onFilesUpload={handleFilesUpload} />
        </div>
      )}
      
      {currentView === 'creating' && uploadedFiles && (
        <div className="creator-screen">
          <div className="navigation">
            <button className="back-btn" onClick={resetToUpload}>
              ← Back to Upload
            </button>
          </div>
          <AudiobookCreator 
            files={uploadedFiles}
            summaryConfig={summaryConfig}
            onComplete={handleAudiobookComplete}
            onGoToDashboard={resetToDashboard}
          />
        </div>
      )}

      {/* Footer for authenticated users */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">Audiobook</span>
            <p>Convert PDFs to audiobooks</p>
          </div>
          
          <div className="footer-links">
            <button 
              onClick={() => window.open('/privacy', '_blank')}
              className="footer-link"
            >
              Privacy
            </button>
            <button 
              onClick={() => window.open('/terms', '_blank')}
              className="footer-link"
            >
              Terms
            </button>
            <button 
              onClick={() => window.open('/support', '_blank')}
              className="footer-link"
            >
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

// Router Component
function AppRouter() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'auth', 'privacy', 'terms', 'support'

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') {
      setCurrentPage('privacy');
    } else if (path === '/terms') {
      setCurrentPage('terms');
    } else if (path === '/support') {
      setCurrentPage('support');
    } else {
      setCurrentPage('landing');
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (user) {
    return <AppContent />;
  }

  // Handle legal and support pages
  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'support') {
    return <Support onBack={() => setCurrentPage('landing')} />;
  }

  if (showAuth) {
    return <AuthScreen onBack={() => setShowAuth(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} onNavigate={setCurrentPage} />;
}

export default App;
