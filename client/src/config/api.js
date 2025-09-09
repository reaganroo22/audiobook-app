// API Configuration
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? '/.netlify/functions' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');

export const API_ENDPOINTS = {
  // Upload endpoints
  upload: isProduction ? `${API_BASE_URL}/upload` : `${API_BASE_URL}/api/upload`,
  
  // Audiobook endpoints
  createAudiobook: isProduction ? `${API_BASE_URL}/create-audiobook` : `${API_BASE_URL}/api/audiobook/create`,
  audiobookStatus: (jobId) => isProduction ? `${API_BASE_URL}/audiobook-status/${jobId}` : `${API_BASE_URL}/api/audiobook/status/${jobId}`,
  
  // AI endpoints (fallback to original for dev)
  geminiProcess: `${API_BASE_URL}/api/gemini/process-complete-audiobook`,
  geminiGenerate: `${API_BASE_URL}/api/gemini/generate-audiobook`,
  chatgptSummarize: `${API_BASE_URL}/api/chatgpt/summarize-batch`,
  llamaParse: `${API_BASE_URL}/api/llama-parse/parse`,
};

export const getAudioUrl = (path) => isProduction ? path : `${API_BASE_URL}${path}`;

export default API_BASE_URL;