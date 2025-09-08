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
  const { user, signOut, isGeorgetownStudent } = useAuth();

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
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
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="header-logo">
            <circle cx="24" cy="24" r="22" fill="#1C1C1E" stroke="#FFFFFF" strokeWidth="1"/>
            <rect x="10" y="18" width="12" height="2" rx="1" fill="#FFFFFF" opacity="0.9"/>
            <rect x="10" y="22" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.7"/>
            <rect x="10" y="26" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.5"/>
            <rect x="10" y="30" width="18" height="2" rx="1" fill="#FFFFFF" opacity="0.3"/>
            <circle cx="33" cy="24" r="3" fill="#FFFFFF" opacity="0.9"/>
            <path d="M33 21v6M30 22.5v3M36 22.5v3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h1>AudioDocs</h1>
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
            {isGeorgetownStudent && (
              <span className="georgetown-badge">🎓 Georgetown Student - Free Access</span>
            )}
          </div>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      </div>

      {currentView === 'dashboard' && (
        <Dashboard 
          audiobooks={audiobooks}
          onCreateNew={() => setCurrentView('upload')}
          onUpdateAudiobook={updateAudiobook}
          isGeorgetownStudent={isGeorgetownStudent}
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
            <span className="footer-logo">AudioDocs</span>
            <p>Convert PDFs to audio</p>
          </div>
          
          <div className="footer-links">
            <button 
              onClick={() => window.location.href = '/privacy'}
              className="footer-link"
            >
              Privacy
            </button>
            <button 
              onClick={() => window.location.href = '/terms'}
              className="footer-link"
            >
              Terms
            </button>
            <button 
              onClick={() => window.location.href = '/support'}
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
    const handleRouteChange = () => {
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
    };

    // Handle initial load
    handleRouteChange();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
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
    return <PrivacyPolicy onBack={() => window.history.back()} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={() => window.history.back()} />;
  }

  if (currentPage === 'support') {
    return <Support onBack={() => window.history.back()} />;
  }

  if (showAuth) {
    return <AuthScreen onBack={() => setShowAuth(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} onNavigate={setCurrentPage} />;
}

export default App;
