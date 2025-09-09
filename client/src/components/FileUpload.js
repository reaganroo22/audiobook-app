import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onFileUpload({
        filename: response.data.filename,
        originalname: response.data.originalname,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`file-upload-dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-content">
          <div className="upload-icon">📄</div>
          {isDragActive ? (
            <p>Drop your document here...</p>
          ) : (
            <>
              <h3>Upload Your Document</h3>
              <p>Drag & drop your document here, or click to browse</p>
              <p className="file-types">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;