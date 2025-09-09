import React, { useState } from 'react';
import SummaryConfig from './SummaryConfig';
import { API_ENDPOINTS } from '../config/api';
import './MultiFileUpload.css';

const MultiFileUpload = ({ onFilesUpload }) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summaryConfig, setSummaryConfig] = useState({
    enablePageSummaries: true,
    pageInterval: 1,
    enableFullSummary: true,
    summaryStyle: 'intelligent'
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      uploaded: false
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (fromIndex, toIndex) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const formData = new FormData();
        formData.append('document', fileObj.file);
        
        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));
        
        const response = await fetch(API_ENDPOINTS.upload, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
          uploadedFiles.push({
            filename: result.filename,
            originalname: result.originalname,
            order: i
          });
          
          // Update file status
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'completed', uploaded: true } : f
          ));
        } else {
          throw new Error(result.error || 'Upload failed');
        }
        
        // Small delay between uploads
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Call parent callback with uploaded files and summary config
      onFilesUpload(uploadedFiles, summaryConfig);
      
      // Reset component state after successful upload
      setFiles([]);
      
    } catch (error) {
      console.error('Upload error:', error);
      // Update failed files
      setFiles(prev => prev.map(f => 
        !f.uploaded ? { ...f, status: 'error' } : f
      ));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="multi-file-upload">
      <div className="upload-header">
        <h2>Document Library</h2>
        <p>Select and arrange your documents with precision</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">+</div>
          <h3>Drop documents here or click to select</h3>
          <p>Multiple PDF files supported</p>
        </div>
        
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h3>Documents ({files.length})</h3>
            <p>Drag to reorder • Click to remove</p>
          </div>
          
          <div className="files">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={`file-item ${file.status}`}
                draggable={!uploading}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  moveFile(fromIndex, index);
                }}
              >
                <div className="file-drag-handle">⋮⋮</div>
                
                <div className="file-icon">◯</div>
                
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-details">
                    {formatFileSize(file.size)} • Position {index + 1}
                  </div>
                </div>
                
                <div className="file-status">
                  {file.status === 'pending' && <span className="status-pending">Ready</span>}
                  {file.status === 'uploading' && <div className="status-uploading">●</div>}
                  {file.status === 'completed' && <span className="status-completed">●</span>}
                  {file.status === 'error' && <span className="status-error">●</span>}
                </div>
                
                <button
                  className="remove-file"
                  onClick={() => removeFile(file.id)}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {files.length > 0 && (
            <SummaryConfig 
              config={summaryConfig}
              onChange={setSummaryConfig}
              totalPages={files.reduce((total, file) => {
                // Rough estimate: 1 page per 50KB for PDFs
                return total + Math.max(1, Math.ceil(file.size / 50000));
              }, 0)}
            />
          )}
          
          <div className="upload-actions">
            <button
              className="upload-all-btn"
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <div className="upload-spinner"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Generate Audio from {files.length} Document{files.length > 1 ? 's' : ''}</span>
              )}
            </button>
            
            <button
              className="clear-all-btn"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;