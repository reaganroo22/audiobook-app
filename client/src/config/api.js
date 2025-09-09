// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Upload endpoints
  upload: `${API_BASE_URL}/api/upload`,
  
  // Audiobook endpoints
  createAudiobook: `${API_BASE_URL}/api/audiobook/create`,
  audiobookStatus: (jobId) => `${API_BASE_URL}/api/audiobook/status/${jobId}`,
  
  // AI endpoints
  geminiProcess: `${API_BASE_URL}/api/gemini/process-complete-audiobook`,
  geminiGenerate: `${API_BASE_URL}/api/gemini/generate-audiobook`,
  chatgptSummarize: `${API_BASE_URL}/api/chatgpt/summarize-batch`,
  llamaParse: `${API_BASE_URL}/api/llama-parse/parse`,
};

export const getAudioUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;