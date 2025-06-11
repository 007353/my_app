// src/components/DetectionResults.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import config from '../config';
import axios from 'axios';

// Modern architectural theme colors
const theme = {
  primary: '#2c3e50',       // Dark blue-gray
  secondary: '#34495e',     // Lighter blue-gray
  accent: '#3498db',        // Blue accent
  accentDark: '#2980b9',    // Darker blue
  success: '#2ecc71',       // Green
  successDark: '#27ae60',   // Darker green
  light: '#ecf0f1',         // Light gray
  lightAlt: '#f8f9fa',      // Lighter gray
  border: '#dfe6e9',        // Border color
  text: '#2d3436',          // Main text
  textLight: '#636e72',     // Secondary text
};

// Grid Layout Container
const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1600px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: minmax(800px, 3fr) minmax(300px, 2fr);
  }
`;

const Title = styled.h2`
  text-align: center;
  color: ${theme.primary};
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 1px;
  grid-column: 1 / -1;
  position: relative;
  
  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: ${theme.accent};
  }
`;

// Left Column (Image Container)
const ImageSection = styled.section`
  background: ${theme.light};
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  height: fit-content;
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: ${theme.primary};
    font-weight: 500;
    display: flex;
    align-items: center;
    
    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 20px;
      background: ${theme.accent};
      margin-right: 10px;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.1);
  
  @media (max-width: 900px) {
    width: 100%;
    height: auto;
    aspect-ratio: 4/3;
  }
`;

const StyledCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: ${props => props.isDrawingMode ? 'crosshair' : 'default'};
`;

const ResultImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const ImageCaption = styled.div`
  text-align: center;
  color: ${theme.textLight};
  margin-top: 0.75rem;
  font-size: 0.9rem;
  font-style: italic;
`;

// Right Column (Controls)
const ControlsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    color: ${theme.primary};
    font-weight: 500;
    display: flex;
    align-items: center;
    
    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 20px;
      background: ${theme.accent};
      margin-right: 10px;
    }
  }
`;

// Threshold Controls
const SliderContainer = styled.div`
  background: ${theme.lightAlt};
  border-radius: 12px;
  padding: 1.5rem;
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SliderLabel = styled.label`
  font-weight: 600;
  color: ${theme.primary};
  font-size: 1rem;
`;

const SliderValue = styled.span`
  font-weight: 700;
  color: ${theme.accent};
  min-width: 50px;
  text-align: right;
  font-size: 1.125rem;
  background: rgba(52, 152, 219, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
`;

const SliderInput = styled.input`
  width: 100%;
  margin: 1rem 0;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: ${theme.border};
  outline: none;
  transition: background 0.3s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${theme.accent};
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(41, 128, 185, 0.5);
    transition: transform 0.2s;
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${theme.accent};
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(41, 128, 185, 0.5);
    transition: transform 0.2s;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
    }
  }
`;

const SliderScale = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 2px;
`;

const ScaleMark = styled.div`
  font-size: 0.75rem;
  color: ${theme.textLight};
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    height: 5px;
    width: 1px;
    background-color: ${theme.border};
  }
`;

// Button Styling
const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${props => props.primary ? theme.success : theme.accent};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transition: left 0.7s;
  }
  
  &:hover {
    transform: translateY(-3px);
    background-color: ${props => props.primary ? theme.successDark : theme.accentDark};
    box-shadow: 0 4px 12px ${props => 
      props.primary 
      ? 'rgba(39, 174, 96, 0.3)' 
      : 'rgba(41, 128, 185, 0.3)'
    };
    
    &:before {
      left: 100%;
    }
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &:before {
      display: none;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-left: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Info and Debug Sections
const InfoCard = styled(Card)`
  margin-top: 0rem;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  background-color: ${props => props.error ? '#fff3f3' : '#eaffea'};
  border: 1px solid ${props => props.error ? '#ffcaca' : '#b7e1b7'};
  color: ${props => props.error ? '#e74c3c' : '#27ae60'};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const InfoItem = styled.div`
  background: ${theme.lightAlt};
  padding: 0.75rem;
  border-radius: 4px;
  
  strong {
    font-size: 0.8rem;
    color: ${theme.textLight};
    display: block;
    margin-bottom: 0.25rem;
  }
  
  span {
    font-size: 0.9rem;
    color: ${theme.primary};
    font-weight: 500;
  }
`;

// Add new styled components for preview modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${theme.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1001;
  
  &:hover {
    background: ${theme.secondary};
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 1200px;
  height: 900px;
  
  @media (max-width: 1200px) {
    width: 90vw;
    height: auto;
    aspect-ratio: 4/3;
  }
`;

const PreviewCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PreviewButton = styled.button`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: ${theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 20;
  
  &:hover {
    background: ${theme.accentDark};
  }
`;

const ClassSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  margin-right: 1rem;
  font-size: 0.9rem;
  background: white;
  min-width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${theme.accent};
  }
  
  option {
    padding: 5px;
  }
  
  option:first-child {
    font-weight: bold;
    color: ${theme.textLight};
  }
`;

const DrawingControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  background: ${theme.lightAlt};
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid ${theme.border};
`;

const ManualBoxesList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  border: 1px solid ${theme.border};
`;

const BoxItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid ${theme.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.lightAlt};
  }
`;

const BoxColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 0.5rem;
  background: ${props => props.color};
`;

const DeleteButton = styled.button`
  padding: 0.25rem 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: auto;
  
  &:hover {
    background: #c0392b;
  }
`;

const KeypointsList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  border: 1px solid ${theme.border};
`;

const KeypointItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid ${theme.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.lightAlt};
  }
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? theme.success : theme.accent};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 1rem;
  
  &:hover {
    background: ${props => props.active ? theme.successDark : theme.accentDark};
  }
`;

// Utility: Get color for type/class
function getColorForType(type, className) {
  const name = className?.toLowerCase?.() || '';
  if (type === 'furniture') {
    switch (name) {
      case 'armchair': return 'darkblue';
      case 'centertable': return 'darkred';
      case 'diningtable': return 'coral';
      case 'gasstove': return 'magenta';
      case 'largesofa': return 'red';
      case 'sidetable': return 'khaki';
      case 'toiletseat': return 'blue';
      case 'washbasin': return 'green';
      case 'bed': return '#E34234';
      case 'fridge': return 'black';
      case 'sink': return 'mediumseagreen';
      case 'tv': return 'cyan';
      case 'wardrobe': return 'purple';
      default: return 'gray';
    }
  } else if (type === 'wall_door') {
    if (name === 'wall') return 'green';
    if (name === 'door') return 'brown';
    if (name === 'window') return 'orange';
    if (name === 'slider') return 'purple';
  }
  return 'gray';
}

const DetectionResults = ({ results, onNewImage }) => {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const hasRedirectedRef = useRef(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [boxDebug, setBoxDebug] = useState([]);
  const [lastFilesError, setLastFilesError] = useState(false);

  // State for confidence threshold
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [hasAppliedConfidence, setHasAppliedConfidence] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [confidenceDebounceTimer, setConfidenceDebounceTimer] = useState(null);

  // View 3D button timer states
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [buttonTimerCount, setButtonTimerCount] = useState(10);
  
  // Google Meet URL
  const [redirectUrl] = useState('https://meet.google.com/wrr-zvtt-rwu');
  const [keypoints, setKeypoints] = useState([]);
  const [isAddingKeypoints, setIsAddingKeypoints] = useState(false);
  const [selectedKeypointType, setSelectedKeypointType] = useState('top');
  const [selectedBox, setSelectedBox] = useState(null);

  // Drawing states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageLoaded, setPreviewImageLoaded] = useState(false);
  const previewCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [manualBoxes, setManualBoxes] = useState([]);
  const [selectedClass, setSelectedClass] = useState({ type: 'wall_door', name: 'wall' });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  
  // Start the countdown in the button
  const startButtonTimer = () => {
    setIsTimerActive(true);
    setButtonTimerCount(10);
  };

  // Handle the timer countdown with useEffect
  useEffect(() => {
    let timer = null;
    
    if (isTimerActive) {
      hasRedirectedRef.current = false;
      
      timer = setInterval(() => {
        setButtonTimerCount(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              window.open(redirectUrl, '_blank');
              console.log("Opening Google Meet: " + redirectUrl);
            }
            
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, redirectUrl]);

  const openGoogleMeet = () => {
    startButtonTimer();
  };

  // Function to determine the image source
  const getImageSource = useCallback(() => {
    if (!results) return '';
    
    if (results.resized_path) {
      const path = results.resized_path;
      const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
      const filename = path.substring(lastSlashIndex + 1);
      return `http://localhost:5000/direct-resized/${filename}`;
    }
    
    if (results.image_path) {
      const path = results.image_path;
      const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
      const filename = path.substring(lastSlashIndex + 1);
      return `http://localhost:5000/direct-resized/${filename}`;
    }
    
    if (results.relative_path) {
      return `http://localhost:5000/${results.relative_path}`;
    }
    
    console.log("Falling back to base64 image");
    return `data:image/jpeg;base64,${results.image}`;
  }, [results]);

  // Function to try to load the latest output files
  const tryLoadLatestOutputFiles = useCallback(async () => {
    console.log("Attempting to load the latest output files...");
    
    try {
      const latestFilesResponse = await fetch(`http://localhost:5000/get-latest-files`);
      
      if (!latestFilesResponse.ok) {
        console.error(`Failed to get latest files list: ${latestFilesResponse.status} ${latestFilesResponse.statusText}`);
        setLastFilesError(true);
        return null;
      }
      
      const latestFiles = await latestFilesResponse.json();
      
      if (!latestFiles.furniture_output || !latestFiles.wall_door_output) {
        console.error("Latest output files not found");
        setLastFilesError(true);
        return null;
      }
      
      console.log("Found latest files:", latestFiles);
      
      const furnitureResponse = await fetch(`http://localhost:5000/get-file?path=${encodeURIComponent(latestFiles.furniture_output)}`);
      const wallDoorResponse = await fetch(`http://localhost:5000/get-file?path=${encodeURIComponent(latestFiles.wall_door_output)}`);
      
      if (furnitureResponse.ok && wallDoorResponse.ok) {
        const furnitureData = await furnitureResponse.json();
        const wallDoorData = await wallDoorResponse.json();
        
        const specificDetections = [];
        const wallRelatedClasses = new Set(['wall', 'door', 'window', 'slider']);
        
        if (furnitureData && furnitureData.predictions) {
          furnitureData.predictions.forEach(prediction => {
            if (!wallRelatedClasses.has(prediction.class.toLowerCase())) {
              specificDetections.push({
                class_name: prediction.class,
                type: 'furniture',
                confidence: prediction.confidence,
                box: {
                  x1: prediction.x - prediction.width / 2,
                  y1: prediction.y - prediction.height / 2,
                  width: prediction.width,
                  height: prediction.height
                }
              });
            }
          });
        }
        
        if (wallDoorData && wallDoorData.predictions) {
          wallDoorData.predictions.forEach(prediction => {
            specificDetections.push({
              class_name: prediction.class,
              type: 'wall_door',
              confidence: prediction.confidence,
              box: {
                x1: prediction.x - prediction.width / 2,
                y1: prediction.y - prediction.height / 2,
                width: prediction.width,
                height: prediction.height
              }
            });
          });
        }
        
        console.log(`Loaded ${specificDetections.length} detections from latest output files`);
        setLastFilesError(false);
        return specificDetections;
      } else {
        console.error("Failed to load one or both output files");
        setLastFilesError(true);
        return null;
      }
    } catch (error) {
      console.error("Error loading output files:", error);
      setLastFilesError(true);
      return null;
    }
  }, []);

  // Apply confidence threshold to detections
  const applyConfidenceThreshold = useCallback((thresholdValue = confidenceThreshold) => {
    setHasAppliedConfidence(true);
    
    const modelConfidenceThreshold = thresholdValue / 100;
    console.log(`Applying confidence threshold: ${thresholdValue}% (${modelConfidenceThreshold})`);
    
    tryLoadLatestOutputFiles().then(detections => {
      if (detections && detections.length > 0) {
        const filtered = detections.filter(detection => 
          detection.confidence >= modelConfidenceThreshold
        );
        
        console.log(`Filtered from ${detections.length} to ${filtered.length} detections`);
        setFilteredDetections(filtered);
        
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (filtered.length > 0) {
            filtered.forEach((detection, index) => {
              const box = detection.box;
              
              let x = parseFloat(box.x1) || 0;
              let y = parseFloat(box.y1) || 0;
              let width = parseFloat(box.width) || 0;
              let height = parseFloat(box.height) || 0;
              
              if (width <= 0 || height <= 0) return;
              
              let color = 'gray';
              const type = detection.type || 'furniture';
              const className = detection.class_name.toLowerCase();
              
              color = getColorForType(type, className);
              
              ctx.strokeStyle = color;
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);
              
              ctx.fillStyle = color;
              ctx.font = '16px Arial';
              ctx.fillText(
                `${detection.class_name} ${Math.round((detection.confidence || 0) * 100)}%`, 
                x, y > 20 ? y - 5 : y + 20
              );
            });
          } else {
            setBoxDebug([`No detections meet the ${thresholdValue}% confidence threshold`]);
          }
        }
      }
    });
  }, [confidenceThreshold, tryLoadLatestOutputFiles]);

  // Define drawDetections 
  const drawDetections = useCallback(() => {
    if (!imageLoaded || !canvasRef.current || !results) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 800;
    canvas.height = 600;
    
    console.log("Drawing detections on 800x600 canvas");
    
    const newBoxDebug = [];
    
    if (lastFilesError) {
      setBoxDebug(["Latest files not found. Please check the server's get-latest-files endpoint."]);
      return;
    }
    
    if (hasAppliedConfidence) {
      if (filteredDetections.length > 0) {
        console.log("Using filtered detections:", filteredDetections.length);
        
        filteredDetections.forEach((detection, index) => {
          const box = detection.box;
          
          let x = parseFloat(box.x1) || 0;
          let y = parseFloat(box.y1) || 0;
          let width = parseFloat(box.width) || 0;
          let height = parseFloat(box.height) || 0;
          
          if (width <= 0 || height <= 0) return;
          
          let color = getColorForType(detection.type || 'furniture', detection.class_name);
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          ctx.fillStyle = color;
          ctx.font = '16px Arial';
          ctx.fillText(
            `${detection.class_name} ${Math.round((detection.confidence || 0) * 100)}%`, 
            x, y > 20 ? y - 5 : y + 20
          );
          
          newBoxDebug.push(`Box ${index} (${detection.class_name}): x=${x}, y=${y}, w=${width}, h=${height}`);
        });
      } else {
        newBoxDebug.push(`No detections meet the ${confidenceThreshold}% confidence threshold`);
      }
      setBoxDebug(newBoxDebug);
      return;
    }
    
    console.log("No threshold applied yet, loading all detections");
    tryLoadLatestOutputFiles().then(specificDetections => {
      if (specificDetections && specificDetections.length > 0) {
        console.log("Loaded detections from latest output files:", specificDetections.length);
        
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          specificDetections.forEach((detection, index) => {
            const box = detection.box;
            
            let x = parseFloat(box.x1) || 0;
            let y = parseFloat(box.y1) || 0;
            let width = parseFloat(box.width) || 0;
            let height = parseFloat(box.height) || 0;
            
            if (width <= 0 || height <= 0) return;
            
            let color = getColorForType(detection.type || 'furniture', detection.class_name);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            ctx.fillStyle = color;
            ctx.font = '16px Arial';
            ctx.fillText(
              `${detection.class_name} ${Math.round((detection.confidence || 0) * 100)}%`, 
              x, y > 20 ? y - 5 : y + 20
            );
            
            newBoxDebug.push(`Box ${index} (${detection.class_name}): x=${x}, y=${y}, w=${width}, h=${height}`);
          });
          
          setBoxDebug(newBoxDebug);
        }, 500);
        
        return;
      } else {
        console.log("No detections found in latest output files");
        newBoxDebug.push("No detections found from latest files");
        setBoxDebug(newBoxDebug);
      }
    }).catch(error => {
      console.error("Error loading latest files:", error);
      newBoxDebug.push("Error loading latest output files");
      setBoxDebug(newBoxDebug);
    });
    
  }, [imageLoaded, results, tryLoadLatestOutputFiles, lastFilesError, 
      hasAppliedConfidence, filteredDetections, confidenceThreshold]);

  // Set image url when results change
  useEffect(() => {
    if (results) {
      const source = getImageSource();
      console.log("Using image source:", source);
      setImageUrl(source);
      
      console.log("Results structure:", Object.keys(results));
      
      if (results.unscaled_detections) {
        console.log("Found unscaled detections:", results.unscaled_detections.length);
      }
      
      if (results.furniture) {
        console.log("Furniture objects:", Object.keys(results.furniture).length);
      }
      if (results.wall_door) {
        console.log("Wall/door objects:", Object.keys(results.wall_door).length);
      }
      if (results.detections) {
        console.log("Detection count:", results.detections.length);
      }
      
      setConfidenceThreshold(1);
      setUploadStatus(null);
      setHasAppliedConfidence(false);
      setProcessingStatus(null);
    }
  }, [results, getImageSource]);

  // Handle image loading errors
  const handleImageError = useCallback(() => {
    console.warn("Failed to load image from URL:", imageUrl);
    setImageError(true);
    
    if (results && results.image_path) {
      try {
        const path = results.image_path;
        const fullUrl = `http://localhost:5000/${path.replace(/\\/g, '/')}`;
        console.log("Trying alternative URL:", fullUrl);
        setImageUrl(fullUrl);
        return;
      } catch (err) {
        console.error("Error with alternative URL:", err);
      }
    }
    
    if (results && results.resized_path) {
      try {
        const path = results.resized_path;
        const fullUrl = `http://localhost:5000/${path.replace(/\\/g, '/')}`;
        console.log("Trying alternative URL:", fullUrl);
        setImageUrl(fullUrl);
        return;
      } catch (err) {
        console.error("Error with alternative URL:", err);
      }
    }
    
    if (results && results.image) {
      console.log("Falling back to base64 image data");
      setImageUrl(`data:image/jpeg;base64,${results.image}`);
    }
  }, [imageUrl, results]);

  // Handle image loading success
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      console.log(`Detection result image loaded, dimensions: ${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`);
      setImageLoaded(true);
      setImageError(false);
    }
  }, []);

  const handleConfidenceChange = useCallback((e) => {
    const newValue = parseInt(e.target.value);
    setConfidenceThreshold(newValue);
    
    if (confidenceDebounceTimer) {
      clearTimeout(confidenceDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      applyConfidenceThreshold(newValue);
    }, 1000);
    
    setConfidenceDebounceTimer(timer);
  }, [confidenceDebounceTimer, applyConfidenceThreshold]);

  // Generate new JSON files from model with the new threshold
  const generateNewJsonFiles = useCallback(async () => {
    if (!hasAppliedConfidence) {
      alert("Please apply confidence threshold first");
      return;
    }
    
    setIsProcessing(true);
    setProcessingStatus(null);
    
    try {
      const modelConfidenceThreshold = confidenceThreshold / 100;
      
      const sessionId = results?.session_id || 
                      results?.sessionId || 
                      results?.data?.session_id || 
                      localStorage.getItem('currentSessionId');
      
      console.log("Using session ID for reprocessing:", sessionId);
      
      const response = await fetch('http://localhost:5000/reprocess-with-threshold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confidence_threshold: modelConfidenceThreshold,
          session_id: sessionId
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Reprocessing successful:", result);
        
        const manualBoxesAdded = result.manual_boxes_added || false;
        
        setProcessingStatus({
          success: true,
          message: `Files successfully reprocessed with new threshold${manualBoxesAdded ? " and manual boxes added" : ""}`,
          data: result
        });
      } else {
        const error = await response.json();
        console.error("Reprocessing failed:", error);
        setProcessingStatus({
          success: false,
          message: error.message || "Failed to reprocess with new threshold"
        });
      }
    } catch (error) {
      console.error("Error during reprocessing:", error);
      setProcessingStatus({
        success: false,
        message: "An error occurred during reprocessing"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [confidenceThreshold, hasAppliedConfidence, results]);

  // Handle file selection for new image upload
  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        console.log('File uploaded successfully:', result);
        setUploadStatus({
          success: true,
          message: 'File uploaded successfully! Processing image...',
        });
        
        return fetch('http://localhost:5000/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: result.filename,
          }),
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Processing failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(processResult => {
        console.log('Image processed successfully:', processResult);
        setUploadStatus({
          success: true,
          message: 'Image processed successfully!',
        });
        
        if (onNewImage) {
          onNewImage(processResult);
        }
      })
      .catch(error => {
        console.error('Error during upload or processing:', error);
        setUploadStatus({
          success: false,
          message: `Error: ${error.message}`,
        });
      })
      .finally(() => {
        setIsUploading(false);
      });
  }, [onNewImage]);

  // Mouse event handlers for drawing
  const handleCanvasMouseDown = useCallback((e) => {
    if (!isDrawingMode) return;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  }, [isDrawingMode]);
  
  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentBox({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    });
  }, [isDrawing, startPoint]);
  
  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing || !currentBox) return;
    
    if (currentBox.width > 3 || currentBox.height > 3) {
      setManualBoxes(prev => [...prev, {
        ...currentBox,
        class_name: selectedClass.name,
        type: selectedClass.type
      }]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  }, [isDrawing, currentBox, selectedClass]);
  
  const handleCanvasMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  }, []);

  // Helper function to get color based on type and class
  const getColorForTypeLocal = useCallback((type, className) => {
    return getColorForType(type, className);
  }, []);

  // Handle canvas click for keypoint placement - MOVED BEFORE useEffect
  const handleCanvasClick = useCallback((e) => {
    if (!isAddingKeypoints || selectedBox === null) return;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const newKeypoint = {
      type: selectedKeypointType,
      x: x,
      y: y
    };
    
    const updatedKeypoints = [...keypoints, newKeypoint];
    setKeypoints(updatedKeypoints);
    
    setManualBoxes(prev => {
      const updatedBoxes = [...prev];
      const box = {...updatedBoxes[selectedBox]};
      
      box.keypoints = updatedKeypoints;
      
      const topKeypoint = updatedKeypoints.find(kp => kp.type === 'top');
      const bottomKeypoint = updatedKeypoints.find(kp => kp.type === 'bottom');
      
      if (topKeypoint) {
        box.TopX = topKeypoint.x;
        box.TopY = topKeypoint.y;
      }
      
      if (bottomKeypoint) {
        box.BottomX = bottomKeypoint.x;
        box.BottomY = bottomKeypoint.y;
      }
      
      updatedBoxes[selectedBox] = box;
      return updatedBoxes;
    });
    
    setIsAddingKeypoints(false);
  }, [isAddingKeypoints, selectedBox, selectedKeypointType, keypoints]);

  // Add preview handlers
  const openPreview = () => {
    setIsPreviewOpen(true);
    setPreviewImageLoaded(false);
  };
  
  const closePreview = () => {
    setIsPreviewOpen(false);
  };
  
  // Redraw function for both main and preview canvas
  const redrawDetectionsAndBoxes = useCallback((canvas = canvasRef.current, scale = {x:1, y:1}) => {
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw AI detections
    filteredDetections.forEach(detection => {
      const box = detection.box;
      const color = getColorForTypeLocal(detection.type, detection.class_name);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 * scale.x;
      ctx.strokeRect(box.x1 * scale.x, box.y1 * scale.y, box.width * scale.x, box.height * scale.y);
      ctx.fillStyle = color;
      ctx.font = `${16 * scale.x}px Arial`;
      ctx.fillText(
        `${detection.class_name} ${Math.round(detection.confidence * 100)}%`,
        box.x1 * scale.x, box.y1 * scale.y > 20 ? box.y1 * scale.y - 5 : box.y1 * scale.y + 20
      );
    });
    
    // Draw manual boxes
    manualBoxes.forEach((box, index) => {
      const color = getColorForTypeLocal(box.type, box.class_name);
      const isSelected = index === selectedBox;
      
      ctx.strokeStyle = isSelected ? 'yellow' : color;
      ctx.lineWidth = isSelected ? 4 * scale.x : 3 * scale.x;
      ctx.setLineDash([5 * scale.x, 5 * scale.x]);
      ctx.strokeRect(box.x * scale.x, box.y * scale.y, box.width * scale.x, box.height * scale.y);
      ctx.setLineDash([]);
      
      ctx.fillStyle = isSelected ? 'yellow' : color;
      ctx.font = `${16 * scale.x}px Arial`;
      ctx.fillText(
        `${box.class_name} (Manual)`,
        box.x * scale.x, box.y * scale.y > 20 ? box.y * scale.y - 5 : box.y * scale.y + 20
      );
      
      if (box.keypoints && box.keypoints.length > 0) {
        box.keypoints.forEach(kp => {
          ctx.beginPath();
          ctx.arc(kp.x * scale.x, kp.y * scale.y, 5 * scale.x, 0, 2 * Math.PI);
          ctx.fillStyle = kp.type === 'top' ? 'blue' : 'red';
          ctx.fill();
          
          ctx.fillText(
            kp.type,
            kp.x * scale.x + 10, 
            kp.y * scale.y - 10
          );
        });
      }
    });
    
    // Draw current box if drawing
    if (isDrawing && currentBox) {
      const color = getColorForTypeLocal(selectedClass.type, selectedClass.name);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 * scale.x;
      ctx.setLineDash([5 * scale.x, 5 * scale.x]);
      ctx.strokeRect(currentBox.x * scale.x, currentBox.y * scale.y, currentBox.width * scale.x, currentBox.height * scale.y);
      ctx.setLineDash([]);
    }
  }, [imageLoaded, filteredDetections, manualBoxes, isDrawing, currentBox, selectedClass, selectedBox, getColorForTypeLocal]);

  // Canvas setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    canvas.width = 800;
    canvas.height = 600;
    if (isDrawingMode) {
      canvas.style.cursor = 'crosshair';
      canvas.onmousedown = handleCanvasMouseDown;
      canvas.onmousemove = handleCanvasMouseMove;
      canvas.onmouseup = handleCanvasMouseUp;
      canvas.onmouseleave = handleCanvasMouseLeave;
    } else {
      canvas.style.cursor = 'default';
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.onmouseleave = null;
    }
    redrawDetectionsAndBoxes(canvas);
    return () => {
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.onmouseleave = null;
    };
  }, [isDrawingMode, imageLoaded, handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp, handleCanvasMouseLeave, redrawDetectionsAndBoxes]);

  // NOW the useEffect can safely reference handleCanvasClick
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (isAddingKeypoints) {
      canvas.onclick = handleCanvasClick;
    } else {
      canvas.onclick = null;
    }
    
    return () => {
      if (canvas) canvas.onclick = null;
    };
  }, [isAddingKeypoints, handleCanvasClick]);

  // Preview canvas effect
  useEffect(() => {
    if (isPreviewOpen && previewImageLoaded && previewCanvasRef.current) {
      const canvas = previewCanvasRef.current;
      canvas.width = 1200;
      canvas.height = 900;
      redrawDetectionsAndBoxes(canvas, {x: 1200/800, y: 900/600});
    }
  }, [isPreviewOpen, previewImageLoaded, redrawDetectionsAndBoxes]);

  // Save manual boxes
  // Save manual boxes - CORRECTED VERSION
const saveManualBoxes = useCallback(async () => {
  if (manualBoxes.length === 0) {
    alert("No boxes to save! Please draw at least one box first.");
    return;
  }
  
  // Get scale factors
  const scaleX = results?.scale_factors?.scale_x || 1;
  const scaleY = results?.scale_factors?.scale_y || 1;
  
  // Get session ID using multiple fallbacks
  const sessionId = results?.session_id || 
                    results?.sessionId || 
                    results?.data?.session_id || 
                    localStorage.getItem('currentSessionId');
  
  console.log("DEBUG: Scale factors:", { scaleX, scaleY });
  console.log("DEBUG: Original manual boxes:", JSON.stringify(manualBoxes, null, 2));
  
  if (!sessionId) {
    alert('Error: Unable to find session ID. Please try uploading the image again.');
    return;
  }
  
  // Format boxes with the specific wall/window logic using center coordinates
  const boxesData = manualBoxes.map(box => {
    // Calculate center coordinates first (from the top-left coordinates)
    const centerX = (box.x + box.width / 2);
    const centerY = (box.y + box.height / 2);
    
    // Apply scale factors to center coordinates
    const scaledCenterX = centerX * scaleX;
    const scaledCenterY = centerY * scaleY;
    
    // Apply scale factors to dimensions
    const scaledWidth = box.width * scaleX;
    const scaledHeight = box.height * scaleY;
    
    // Check if this is a window and if scaled width or height exceeds 113
    let className = box.class_name;
    if (box.class_name === 'window' && (scaledWidth > 113 || scaledHeight > 113)) {
      className = 'slider';
      console.log(`Converted window to slider based on scaled dimensions: width=${scaledWidth}, height=${scaledHeight}`);
    }
    
    // Determine orientation based on dimensions
    const orientation = scaledHeight > scaledWidth ? "Vertical" : "Horizontal";
    
    // Calculate x1, y1, x2, y2 based on the specific logic
    let x1, y1, x2, y2;
    
    if (scaledWidth >= scaledHeight) {
      // Horizontal line
      x1 = scaledCenterX - scaledWidth / 2;
      x2 = scaledCenterX + scaledWidth / 2;
      y1 = scaledCenterY;
      y2 = scaledCenterY;
    } else {
      // Vertical line
      x1 = scaledCenterX;
      x2 = scaledCenterX;
      y1 = scaledCenterY - scaledHeight / 2;
      y2 = scaledCenterY + scaledHeight / 2;
    }
    
    // CRITICAL: Process keypoints and scale them
    let scaledKeypoints = [];
    let scaledTopX = null, scaledTopY = null, scaledBottomX = null, scaledBottomY = null;
    
    // Scale the keypoints if they exist
    if (box.keypoints && Array.isArray(box.keypoints) && box.keypoints.length > 0) {
      scaledKeypoints = box.keypoints.map(kp => ({
        type: kp.type,
        x: kp.x * scaleX,  // Scale the keypoint coordinates
        y: kp.y * scaleY
      }));
      
      // Set the individual Top/Bottom coordinates
      const topKeypoint = scaledKeypoints.find(kp => kp.type === 'top');
      const bottomKeypoint = scaledKeypoints.find(kp => kp.type === 'bottom');
      
      if (topKeypoint) {
        scaledTopX = topKeypoint.x;
        scaledTopY = topKeypoint.y;
      }
      
      if (bottomKeypoint) {
        scaledBottomX = bottomKeypoint.x;
        scaledBottomY = bottomKeypoint.y;
      }
    }
    
    // Also check for direct TopX/TopY properties and scale them
    if (box.TopX !== null && box.TopX !== undefined) {
      scaledTopX = box.TopX * scaleX;
    }
    if (box.TopY !== null && box.TopY !== undefined) {
      scaledTopY = box.TopY * scaleY;
    }
    if (box.BottomX !== null && box.BottomX !== undefined) {
      scaledBottomX = box.BottomX * scaleX;
    }
    if (box.BottomY !== null && box.BottomY !== undefined) {
      scaledBottomY = box.BottomY * scaleY;
    }
    
    console.log(`DEBUG: Box ${box.class_name} - Original keypoints:`, box.keypoints);
    console.log(`DEBUG: Box ${box.class_name} - Scaled keypoints:`, scaledKeypoints);
    console.log(`DEBUG: Box ${box.class_name} - TopX: ${scaledTopX}, TopY: ${scaledTopY}, BottomX: ${scaledBottomX}, BottomY: ${scaledBottomY}`);
    
    // Return format exactly matching your example, with FLAT structure
    return {
      name: className,
      class_name: className,
      confidence: 1.0,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      width: scaledWidth,
      height: scaledHeight,
      orientation: orientation,
      x: scaledCenterX,
      y: scaledCenterY,
      type: box.type || "wall_door",
      // INCLUDE THE SCALED KEYPOINTS AND COORDINATES
      keypoints: scaledKeypoints,
      TopX: scaledTopX,
      TopY: scaledTopY,
      BottomX: scaledBottomX,
      BottomY: scaledBottomY
    };
  });
  
  console.log("DEBUG: Formatted boxes for server:", JSON.stringify(boxesData, null, 2));
  
  try {
    // Show user that saving is in progress
    setProcessingStatus({
      success: true,
      message: "Saving manual boxes..."
    });
    
    const response = await fetch('http://localhost:5000/api/save-manual-boxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        session_id: sessionId, 
        boxes: boxesData 
      })
    });
    
    const responseData = await response.json();
    console.log("DEBUG: Server response:", JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to save manual boxes');
    }
    
    // Show success message
    const savedPath = responseData.saved_paths?.combined_detections || 
                     responseData.absolute_paths?.combined_detections || 
                     `output/${sessionId}/combined_detections.json`;
    
    setProcessingStatus({
      success: true,
      message: `${manualBoxes.length} boxes saved successfully! Path: ${savedPath}`
    });
    
  } catch (error) {
    console.error("Save Error:", error);
    setProcessingStatus({
      success: false,
      message: `Error saving manual boxes: ${error.message}`
    });
  }
}, [manualBoxes, results]);

  // Add effect to store session ID when results change
  useEffect(() => {
    if (results?.session_id) {
        console.log('Storing session ID:', results.session_id);
        localStorage.setItem('currentSessionId', results.session_id);
    }
  }, [results]);

  // Add delete box handler
  const handleDeleteBox = useCallback((index) => {
    setManualBoxes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleBoxSelect = (index) => {
    setSelectedBox(index);
    setKeypoints(manualBoxes[index].keypoints || []);
  };

  const handleAddKeypoint = (type) => {
    if (selectedBox === null) {
      alert("Please select a box first");
      return;
    }
    
    setSelectedKeypointType(type);
    setIsAddingKeypoints(true);
  };

  // Draw detections when image is loaded
  useEffect(() => {
    if (imageLoaded) {
      console.log("Image loaded, drawing detections");
      drawDetections();
    }
  }, [imageLoaded, drawDetections]);

  // Add an effect to automatically apply confidence threshold when the image loads
  useEffect(() => {
    if (imageLoaded && results) {
      applyConfidenceThreshold();
    }
  }, [imageLoaded, results, applyConfidenceThreshold]);

  useEffect(() => {
    return () => {
      if (confidenceDebounceTimer) {
        clearTimeout(confidenceDebounceTimer);
      }
    };
  }, [confidenceDebounceTimer]);

  return (
    <ResultsContainer>
      <Title>Detection Results</Title>
      
      <ImageSection>
        <h3>Analyzed Image</h3>
        <ImageContainer>
          <ResultImage 
            ref={imageRef}
            src={imageUrl}
            alt="Detection Result"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <StyledCanvas ref={canvasRef} isDrawingMode={isDrawingMode} />
          <PreviewButton onClick={openPreview}>
            View Larger
          </PreviewButton>
        </ImageContainer>
        
        <DrawingControls>
          <ControlGroup>
            <ToggleButton
              active={isDrawingMode}
              onClick={() => setIsDrawingMode(!isDrawingMode)}
            >
              {isDrawingMode ? 'Disable Drawing' : 'Enable Drawing'}
            </ToggleButton>
            
            {isDrawingMode && (
              <>
                <ClassSelect
                  value={selectedClass.type === 'wall_door' ? `wall_door:${selectedClass.name}` : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [type, name] = e.target.value.split(':');
                      setSelectedClass({ type, name });
                    }
                  }}
                >
                  <option value="">-- Wall Elements --</option>
                  <option value="wall_door:wall">Wall</option>
                  <option value="wall_door:window">Window</option>
                  <option value="wall_door:door">Door</option>
                  <option value="wall_door:slider">Slider</option>
                </ClassSelect>
                
                <ClassSelect
                  value={selectedClass.type === 'furniture' ? `furniture:${selectedClass.name}` : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [type, name] = e.target.value.split(':');
                      setSelectedClass({ type, name });
                    }
                  }}
                >
                  <option value="">-- Furniture --</option>
                  <option value="furniture:armchair">Armchair</option>
                  <option value="furniture:bed">Bed</option>
                  <option value="furniture:centertable">Center Table</option>
                  <option value="furniture:diningtable">Dining Table</option>
                  <option value="furniture:fridge">Fridge</option>
                  <option value="furniture:gasstove">Gas Stove</option>
                  <option value="furniture:largesofa">Large Sofa</option>
                  <option value="furniture:sidetable">Side Table</option>
                  <option value="furniture:sink">Sink</option>
                  <option value="furniture:toiletseat">Toilet Seat</option>
                  <option value="furniture:tv">TV</option>
                  <option value="furniture:wardrobe">Wardrobe</option>
                  <option value="furniture:washbasin">Washbasin</option>
                </ClassSelect>
              </>
            )}
          </ControlGroup>
          
          {manualBoxes.length > 0 && (
            <ControlGroup>
              <ActionButton
                onClick={() => setManualBoxes([])}
                warning
              >
                Clear All Boxes
              </ActionButton>
              <ActionButton
                onClick={saveManualBoxes}
                success
              >
                Save Boxes
              </ActionButton>
            </ControlGroup>
          )}
          
          {manualBoxes.length > 0 && (
            <ManualBoxesList>
              {manualBoxes.map((box, index) => (
                <BoxItem key={index}>
                  <BoxColor color={getColorForTypeLocal(box.type, box.class_name)} />
                  <span>{box.class_name}</span>
                  <DeleteButton onClick={() => handleDeleteBox(index)}>
                    Delete
                  </DeleteButton>
                </BoxItem>
              ))}
            </ManualBoxesList>
          )}
          
          {isDrawingMode && manualBoxes.length > 0 && (
            <div>
              <h4>Add Keypoints to Boxes</h4>
              <div style={{ marginTop: '10px' }}>
                <p>Select a box first, then add keypoints:</p>
                <select 
                  value={selectedBox !== null ? selectedBox : ''} 
                  onChange={(e) => handleBoxSelect(Number(e.target.value))}
                  style={{ marginBottom: '10px', padding: '5px' }}
                >
                  <option value="">-- Select Box --</option>
                  {manualBoxes.map((box, index) => (
                    <option key={index} value={index}>
                      {box.class_name} ({index + 1})
                    </option>
                  ))}
                </select>
                
                {selectedBox !== null && (
                  <div>
                    <ControlGroup>
                      <ActionButton 
                        onClick={() => handleAddKeypoint('top')}
                        disabled={isAddingKeypoints}
                      >
                        Add Top Keypoint
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleAddKeypoint('bottom')}
                        disabled={isAddingKeypoints}
                      >
                        Add Bottom Keypoint
                      </ActionButton>
                      {isAddingKeypoints && (
                        <div style={{ color: 'green', marginLeft: '10px' }}>
                          Click on the image to place the {selectedKeypointType} keypoint
                        </div>
                      )}
                    </ControlGroup>
                    
                    {keypoints.length > 0 && (
                      <KeypointsList>
                        <h4 style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>Keypoints</h4>
                        {keypoints.map((kp, idx) => (
                          <KeypointItem key={idx}>
                            <div style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              background: kp.type === 'top' ? 'blue' : 'red',
                              marginRight: '10px'
                            }}></div>
                            <span>{kp.type}: x={Math.round(kp.x)}, y={Math.round(kp.y)}</span>
                            <DeleteButton 
                              onClick={() => {
                                const updatedKeypoints = keypoints.filter((_, i) => i !== idx);
                                setKeypoints(updatedKeypoints);
                                
                                setManualBoxes(prev => {
                                  const updatedBoxes = [...prev];
                                  const box = {...updatedBoxes[selectedBox]};
                                  box.keypoints = updatedKeypoints;
                                  
                                  const topKeypoint = updatedKeypoints.find(k => k.type === 'top');
                                  const bottomKeypoint = updatedKeypoints.find(k => k.type === 'bottom');
                                  
                                  box.TopX = topKeypoint ? topKeypoint.x : null;
                                  box.TopY = topKeypoint ? topKeypoint.y : null;
                                  box.BottomX = bottomKeypoint ? bottomKeypoint.x : null;
                                  box.BottomY = bottomKeypoint ? bottomKeypoint.y : null;
                                  
                                  updatedBoxes[selectedBox] = box;
                                  return updatedBoxes;
                                });
                              }}
                            >
                              Delete
                            </DeleteButton>
                          </KeypointItem>
                        ))}
                      </KeypointsList>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DrawingControls>
        
        <ImageCaption>
          {imageError ? 'Error loading image. Please try again.' : 'Detected objects are highlighted with bounding boxes'}
        </ImageCaption>
      </ImageSection>
      
      {/* Add Preview Modal */}
      {isPreviewOpen && (
        <ModalOverlay onClick={closePreview}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={closePreview}>×</CloseButton>
            <PreviewContainer>
              <PreviewImage
                src={imageUrl}
                alt="Preview"
                onLoad={() => setPreviewImageLoaded(true)}
              />
              <PreviewCanvas ref={previewCanvasRef} />
            </PreviewContainer>
          </ModalContent>
        </ModalOverlay>
      )}
      
      <ControlsSection>
        <Card>
          <h3>Confidence Threshold</h3>
          <SliderContainer>
            <SliderHeader>
              <SliderLabel htmlFor="confidence-threshold">Detection Confidence</SliderLabel>
              <SliderValue>{confidenceThreshold}%</SliderValue>
            </SliderHeader>
            <SliderInput
              id="confidence-threshold"
              type="range"
              min="1"
              max="100"
              value={confidenceThreshold}
              onChange={handleConfidenceChange}
            />
            <SliderScale>
              <ScaleMark>1%</ScaleMark>
              <ScaleMark>25%</ScaleMark>
              <ScaleMark>50%</ScaleMark>
              <ScaleMark>75%</ScaleMark>
              <ScaleMark>100%</ScaleMark>
            </SliderScale>
          </SliderContainer>
          
          <ButtonsGrid>
            <ActionButton
              primary
              onClick={generateNewJsonFiles}
              disabled={!hasAppliedConfidence || isProcessing}
            >
              {isProcessing ? (
                <>
                  Processing
                  <LoadingSpinner />
                </>
              ) : (
                'Generate JSON'
              )}
            </ActionButton>

            <ActionButton
              primary
              onClick={openGoogleMeet}
              disabled={isTimerActive || !hasAppliedConfidence || isProcessing}
            >
              {isProcessing ? (
                <>
                  Processing
                  <LoadingSpinner />
                </>
              ) : isTimerActive ? (
                <>
                  3D Available in {buttonTimerCount}s
                </>
              ) : (
                'View 3D'
              )}
            </ActionButton>

            <ActionButton onClick={onNewImage} disabled={isUploading}>
              {isUploading ? (
                <>
                  Uploading
                  <LoadingSpinner />
                </>
              ) : (
                'Upload Another Image'
              )}
            </ActionButton>

            <ActionButton
              onClick={async () => {
                try {
                  const sessionId = results?.session_id || 
                     results?.sessionId || 
                     results?.data?.session_id ||
                     localStorage.getItem('currentSessionId');
     
                  if (!sessionId) {
                    alert('Debug: No session ID found!');
                    console.error('Debug: No session ID available');
                    return;
                  }
     
                  console.log(`Debug: Session ID = ${sessionId}`);
     
                  const debugResponse = await fetch(`http://localhost:5000/debug-file-path?session_id=${sessionId}&file_type=combined_detections`);
                  const debugData = await debugResponse.json();
     
                  console.log("Debug response:", debugData);
      
                  const debugMessage = `
                  File Path: ${debugData.file_path}
                  File Exists: ${debugData.file_exists}
                  Session ID: ${debugData.session_id}
                  Absolute Path: ${debugData.absolute_path}
                  Output Directory: ${debugData.output_directory}
                  ${debugData.file_exists ? 'Box Count: ' + debugData.box_count : 'File Not Found'}
                  `;
     
                  alert(debugMessage);
                } catch (err) {
                  console.error('Debug error:', err);
                  alert(`Debug Error: ${err.message}`);
                }
              }}
            >
              View Modified JSON
            </ActionButton>
          </ButtonsGrid>
          
          {processingStatus && (
            <StatusMessage error={!processingStatus.success}>
              {processingStatus.message}
            </StatusMessage>
          )}
        </Card>
        
        <InfoCard>
          <h3>Detection Info</h3>
          <InfoGrid>
            <InfoItem>
              <strong>Total Detections</strong>
              <span>{filteredDetections.length || 'Loading...'}</span>
            </InfoItem>
            <InfoItem>
              <strong>Confidence</strong>
              <span>{confidenceThreshold}%+</span>
            </InfoItem>
            <InfoItem>
              <strong>Image Size</strong>
              <span>800x600</span>
            </InfoItem>
            <InfoItem>
              <strong>Status</strong>
              <span>{lastFilesError ? 'Error' : (imageLoaded ? 'Ready' : 'Loading')}</span>
            </InfoItem>
          </InfoGrid>
          
          {lastFilesError && (
            <StatusMessage error={true}>
              Failed to load latest output files. Please try processing the image again.
            </StatusMessage>
          )}
          
          {boxDebug.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: theme.textLight }}>
              <strong>Debug:</strong> {boxDebug.length} box calculations
            </div>
          )}
        </InfoCard>           
      </ControlsSection>

      <>
        {/* Main content in a column */}
        <div className="flex flex-col items-center justify-center w-full">          
          {uploadStatus && (
            <StatusMessage error={!uploadStatus.success}>
              {uploadStatus.message}
            </StatusMessage>
          )}
        </div>
      </>  
    </ResultsContainer>
  );
};

export default DetectionResults;