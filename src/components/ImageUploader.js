import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import config from '../config';

// Define breakpoints for responsive design
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1200px',
  tv: '1920px'
};

// Media query helpers
const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  laptop: `@media (max-width: ${breakpoints.laptop})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  tv: `@media (min-width: ${breakpoints.tv})`,
};

// Enhanced Styled Components with Responsive Design
const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.08),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 2.5rem;
  max-width: 800px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(52, 152, 219, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
  
  ${media.laptop} {
    padding: 2rem;
    border-radius: 12px;
  }
  
  ${media.tablet} {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  ${media.mobile} {
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    box-shadow: 
      0 5px 15px rgba(0, 0, 0, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }
  
  ${media.tv} {
    max-width: 1200px;
    padding: 3rem;
    border-radius: 24px;
  }
`;

const UploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 2px dashed #3498db;
  border-radius: 16px;
  cursor: pointer;
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  
  &:hover {
    border-color: #2980b9;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(52, 152, 219, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.1);
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
    100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
  }
  
  &:hover::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    animation: pulse 1.5s infinite;
    pointer-events: none;
  }
  
  ${media.laptop} {
    padding: 2rem;
    max-width: 450px;
  }
  
  ${media.tablet} {
    padding: 1.5rem;
    max-width: 400px;
    border-radius: 12px;
  }
  
  ${media.mobile} {
    padding: 1.25rem;
    border-width: 1px;
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(52, 152, 219, 0.15);
    }
  }
  
  ${media.tv} {
    max-width: 700px;
    padding: 3rem;
    border-radius: 20px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  margin-top: 1.25rem;
  font-size: 0.95rem;
  color: #555;
  background-color: rgba(52, 152, 219, 0.08);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border-left: 3px solid #3498db;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '📄';
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.12);
    transform: translateX(3px);
  }
  
  ${media.laptop} {
    max-width: 450px;
    font-size: 0.9rem;
  }
  
  ${media.tablet} {
    max-width: 400px;
    padding: 0.6rem 1rem;
  }
  
  ${media.mobile} {
    margin-top: 1rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 6px;
    border-left-width: 2px;
    
    &::before {
      font-size: 1rem;
      margin-right: 6px;
    }
  }
  
  ${media.tv} {
    max-width: 700px;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }
`;

const Button = styled.button`
  margin-top: 1.75rem;
  padding: 0.85rem 2rem;
  background: ${props => props.disabled ? 
    'linear-gradient(145deg, #d1d1d1, #cccccc)' : 
    'linear-gradient(145deg, #3498db, #2980b9)'};
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled ? 
    '0 2px 5px rgba(0, 0, 0, 0.1)' : 
    '0 4px 15px rgba(52, 152, 219, 0.3)'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${props => props.disabled ? 
      'linear-gradient(145deg, #d1d1d1, #cccccc)' : 
      'linear-gradient(145deg, #2980b9, #2471a3)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 
      '0 2px 5px rgba(0, 0, 0, 0.1)' : 
      '0 7px 20px rgba(52, 152, 219, 0.4)'};
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
    transform: rotate(45deg);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    opacity: 0;
  }
  
  &:hover::after {
    opacity: ${props => props.disabled ? 0 : 1};
  }
  
  ${media.laptop} {
    padding: 0.75rem 1.75rem;
    font-size: 0.95rem;
  }
  
  ${media.tablet} {
    margin-top: 1.5rem;
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }
  
  ${media.mobile} {
    margin-top: 1.25rem;
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 25px;
    letter-spacing: 0.3px;
  }
  
  ${media.tv} {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
    margin-top: 2rem;
    border-radius: 60px;
  }
`;

const InfoText = styled.div`
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(145deg, #e8f4f8, #dcedf3);
  border-radius: 12px;
  font-size: 0.95rem;
  color: #2c3e50;
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid #3498db;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.1);
  box-sizing: border-box;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.15);
    transform: translateX(3px);
  }
  
  &::before {
    content: 'ℹ️';
    margin-right: 10px;
    font-size: 1.1rem;
  }
  
  ${media.laptop} {
    max-width: 450px;
    font-size: 0.9rem;
    padding: 0.9rem 1.15rem;
  }
  
  ${media.tablet} {
    max-width: 400px;
    margin-top: 1rem;
    padding: 0.8rem 1rem;
    border-radius: 10px;
  }
  
  ${media.mobile} {
    font-size: 0.85rem;
    padding: 0.7rem 0.9rem;
    border-radius: 8px;
    border-left-width: 3px;
    
    &::before {
      font-size: 1rem;
      margin-right: 8px;
    }
  }
  
  ${media.tv} {
    max-width: 700px;
    font-size: 1.1rem;
    padding: 1.25rem 1.5rem;
    margin-top: 1.5rem;
    border-radius: 16px;
  }
`;

// New components to enhance UI with responsive design

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  margin-top: 1rem;
  background-color: ${props => {
    switch(props.status) {
      case 'success': return '#2ecc71';
      case 'error': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info':
      default: return '#3498db';
    }
  }};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: ${props => {
      switch(props.status) {
        case 'success': return '"✓"';
        case 'error': return '"✗"';
        case 'warning': return '"⚠"';
        case 'info':
        default: return '"ℹ"';
      }
    }};
    margin-right: 6px;
  }
  
  ${media.tablet} {
    padding: 0.35rem 0.9rem;
    font-size: 0.8rem;
  }
  
  ${media.mobile} {
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
    margin-top: 0.75rem;
  }
  
  ${media.tv} {
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
    margin-top: 1.25rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 500px;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 50px;
  margin-top: 1rem;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background: linear-gradient(90deg, #3498db, #2980b9);
    border-radius: 50px;
    transition: width 0.3s ease;
  }
  
  ${media.laptop} {
    max-width: 450px;
  }
  
  ${media.tablet} {
    max-width: 400px;
    height: 7px;
  }
  
  ${media.mobile} {
    height: 6px;
    margin-top: 0.75rem;
  }
  
  ${media.tv} {
    max-width: 700px;
    height: 10px;
    margin-top: 1.25rem;
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  img {
    width: 100%;
    height: auto;
    display: block;
    transition: all 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &::after {
    content: 'Preview';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background-color: rgba(52, 152, 219, 0.8);
    color: white;
    font-size: 0.8rem;
    text-align: center;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: translateY(0);
  }
  
  ${media.laptop} {
    max-width: 450px;
  }
  
  ${media.tablet} {
    max-width: 400px;
    margin-top: 1.25rem;
    border-radius: 10px;
    
    &::after {
      padding: 0.4rem;
      font-size: 0.75rem;
    }
  }
  
  ${media.mobile} {
    margin-top: 1rem;
    border-radius: 8px;
    
    &:hover {
      transform: scale(1.01);
    }
    
    &::after {
      padding: 0.3rem;
      font-size: 0.7rem;
    }
  }
  
  ${media.tv} {
    max-width: 700px;
    margin-top: 2rem;
    border-radius: 16px;
    
    &::after {
      padding: 0.75rem;
      font-size: 1rem;
    }
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  box-shadow: 
    8px 8px 16px rgba(0, 0, 0, 0.1),
    -8px -8px 16px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(15deg);
  }
  
  svg {
    width: 40px;
    height: 40px;
    color: #3498db;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    color: #2980b9;
    transform: scale(1.1);
  }
  
  ${media.laptop} {
    width: 70px;
    height: 70px;
    
    svg {
      width: 35px;
      height: 35px;
    }
  }
  
  ${media.tablet} {
    width: 60px;
    height: 60px;
    margin-bottom: 0.75rem;
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.1),
      -6px -6px 12px rgba(255, 255, 255, 0.8);
    
    svg {
      width: 30px;
      height: 30px;
    }
  }
  
  ${media.mobile} {
    width: 50px;
    height: 50px;
    box-shadow: 
      4px 4px 8px rgba(0, 0, 0, 0.1),
      -4px -4px 8px rgba(255, 255, 255, 0.8);
    
    svg {
      width: 25px;
      height: 25px;
    }
  }
  
  ${media.tv} {
    width: 100px;
    height: 100px;
    margin-bottom: 1.5rem;
    
    svg {
      width: 50px;
      height: 50px;
    }
  }
`;

const AnimatedText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: #3498db;
    transition: width 0.3s ease;
  }
  
  ${UploadLabel}:hover & {
    color: #3498db;
    
    &::after {
      width: 50%;
    }
  }
  
  ${media.laptop} {
    font-size: 1rem;
  }
  
  ${media.tablet} {
    font-size: 0.95rem;
  }
  
  ${media.mobile} {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    
    &::after {
      height: 1px;
      bottom: -3px;
    }
  }
  
  ${media.tv} {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    
    &::after {
      height: 3px;
      bottom: -7px;
    }
  }
`;

const DragActiveOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 3px dashed #3498db;
  z-index: 10;
  opacity: ${props => props.active ? 1 : 0};
  pointer-events: ${props => props.active ? 'auto' : 'none'};
  transition: all 0.3s ease;
  
  div {
    font-size: 1.5rem;
    font-weight: 600;
    color: #3498db;
    padding: 1rem 2rem;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  ${media.laptop} {
    border-radius: 12px;
    
    div {
      font-size: 1.3rem;
      padding: 0.9rem 1.8rem;
    }
  }
  
  ${media.tablet} {
    border-width: 2px;
    border-radius: 10px;
    
    div {
      font-size: 1.1rem;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
    }
  }
  
  ${media.mobile} {
    border-width: 1px;
    border-radius: 8px;
    backdrop-filter: blur(2px);
    
    div {
      font-size: 0.9rem;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
    }
  }
  
  ${media.tv} {
    border-width: 4px;
    border-radius: 20px;
    
    div {
      font-size: 1.8rem;
      padding: 1.25rem 2.5rem;
      border-radius: 16px;
    }
  }
`;

// SVG Icons - These remain the same as they use relative sizing
const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const LoaderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

// Enhanced ImageUploader Component
const ImageUploader = ({ onImageUploaded, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const fileInputRef = useRef(null);
  
  // Create preview when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    
    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);
  
  // Simulated upload progress for visual feedback
  useEffect(() => {
    if (isUploading && uploadProgress < 95) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 5, 95));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isUploading, uploadProgress]);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };
  
  const processFile = (file) => {
    if (!file) return;
    
    const fileType = file.type;
    
    // Validate file type
    if (!fileType.match('image/jpeg') && !fileType.match('image/jpg') && !fileType.match('image/png')) {
      setError('Please select a valid image file (PNG, JPG, or JPEG)');
      setSelectedFile(null);
      setPreview(null);
      setUploadSuccess(false);
      return;
    }
    
    // Update state
    setSelectedFile(file);
    setError('');
    setUploadStatus('File selected and ready for upload');
    setUploadProgress(0);
    setUploadSuccess(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Preparing upload...');
    setUploadProgress(10);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      setUploadStatus('Uploading to server...');
      
      const response = await axios.post(`${config.API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percentCompleted, 95)); // Cap at 95% until server responds
        }
      });
      
      setUploadProgress(100);
      setUploadStatus('Upload successful!');
      setUploadSuccess(true);
      
      if (response.data && response.data.session_id) {
        setSessionId(response.data.session_id);
        onImageUploaded(response.data.image, response.data.session_id);
      } else {
        setError('Invalid response from server');
        setUploadSuccess(false);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadStatus('Upload failed');
      setError(err.response?.data?.error || `Error: ${err.message}`);
      setUploadProgress(0);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  const getStatusBadgeType = () => {
    if (error) return 'error';
    if (uploadSuccess) return 'success';
    if (uploadStatus.includes('selected')) return 'info';
    if (isUploading) return 'warning';
    return 'info';
  };
  
  const fileSize = selectedFile ? Math.round(selectedFile.size / 1024) : 0; // Convert to KB
  
  // Animation for success state
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        // Keep the success state for 5 seconds
        // You could reset or keep it indefinitely
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  return (
    <UploaderContainer>
      <UploadLabel
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DragActiveOverlay active={isDragging}>
          <div>Drop your image here</div>
        </DragActiveOverlay>
        
        <IconWrapper>
          {isUploading ? <LoaderIcon /> : <UploadIcon />}
        </IconWrapper>
        
        <AnimatedText>
          {selectedFile ? 'Image ready for upload' : 'Drag & drop an image or click to browse'}
        </AnimatedText>
        
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
          Supported formats: PNG, JPG, JPEG
        </div>
        
        <FileInput 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          accept=".jpg,.jpeg,.png" 
        />
      </UploadLabel>
      
      {selectedFile && (
        <FileInfo>
          {selectedFile.name} ({fileSize} KB)
        </FileInfo>
      )}
      
      {uploadStatus && (
        <StatusBadge status={getStatusBadgeType()}>
          {uploadStatus}
        </StatusBadge>
      )}
      
      {(isUploading || uploadProgress > 0) && (
        <ProgressBar progress={uploadProgress} />
      )}
      
      {error && (
        <InfoText style={{ borderLeft: '4px solid #e74c3c', background: 'linear-gradient(145deg, #fde9e7, #fad3d0)' }}>
          <AlertIcon /> {error}
        </InfoText>
      )}
      
      {preview && (
        <PreviewContainer>
          <img src={preview} alt="Preview" />
        </PreviewContainer>
      )}
      
      <Button 
        onClick={handleUpload} 
        disabled={!selectedFile || isUploading || isLoading}
      >
        {isUploading ? 'Uploading...' : isLoading ? 'Processing...' : 'Upload Image'}
      </Button>
      
      {uploadSuccess && (
        <InfoText style={{ borderLeft: '4px solid #2ecc71', background: 'linear-gradient(145deg, #e6f7ef, #d5f2e3)' }}>
          <CheckIcon /> Your image has been successfully uploaded and is ready for processing!
        </InfoText>
      )}
    </UploaderContainer>
  );
};

export default ImageUploader;