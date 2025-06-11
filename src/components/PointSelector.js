import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import config from '../config';

// Architectural theme colors
const theme = {
  primary: '#455a64',     // Blue-gray - primary color
  secondary: '#90a4ae',   // Lighter blue-gray
  accent: '#607d8b',      // Medium blue-gray
  light: '#eceff1',       // Very light blue-gray
  border: '#cfd8dc',      // Light border color
  text: '#263238',        // Dark text
  textLight: '#78909c',   // Light text
  error: '#b71c1c',       // Dark red for errors
  success: '#2e7d32'      // Dark green for success
};

// Main Layout Components
const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 5%;
  width: 100%;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: ${theme.text};
`;

const ContentRow = styled.div`
  display: flex;
  width: 100%;
  gap: 20px;
  margin-bottom: 16px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
`;

const RightColumn = styled.div`
  width: 75%;
`;

// Card and Container Components
const Card = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  padding: 1.5rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const InstructionPanel = styled(Card)`
  border-left: 4px solid ${theme.primary};
  
  h3 {
    margin-top: 0;
    color: ${theme.primary};
    font-weight: 500;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  p {
    margin-bottom: 1.25rem;
    color: ${theme.textLight};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  background-color: ${theme.light};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px;
  height: 600px;
`;

const StyledImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  cursor: ${props => props.isDragging ? 'grabbing' : props.isOverPoint ? 'grab' : 'crosshair'};
  width: 100%;
  height: 100%;
`;

const ErrorMessage = styled.div`
  color: ${theme.error};
  text-align: center;
  font-size: 14px;
  padding: 20px;
`;

// Point List CSS
// const PointList = styled(Card)`
//   h4 {
//     margin-top: 0;
//     color: ${theme.primary};
//     font-weight: 500;
//     font-size: 1rem;
//     margin-bottom: 1rem;
//     border-bottom: 1px solid ${theme.border};
//     padding-bottom: 0.5rem;
//   }
// `;

// const PointListItem = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 0.75rem;
//   background-color: ${props => props.highlight ? theme.light : 'transparent'};
//   border-radius: 3px;
//   margin-bottom: 0.5rem;
//   transition: background-color 0.3s;
//   font-size: 0.9rem;
// `;

// const ColorBox = styled.div`
//   width: 12px;
//   height: 12px;
//   border-radius: 2px;
//   background-color: ${props => props.color};
//   margin-right: 8px;
//   display: inline-block;
// `;

// Step indicators
const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const StepNumber = styled.div`
  background-color: ${props => props.active ? theme.primary : theme.secondary};
  color: white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 12px;
  transition: background-color 0.4s;
  font-size: 0.875rem;
`;

// Input Components
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 20px;
  width: 100%;
`;

const InputGroup = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${theme.text};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${theme.text};
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(69, 90, 100, 0.1);
  }
`;

// Button Components with Animation
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.disabled ? theme.border : props.secondary ? theme.light : theme.primary};
  color: ${props => props.secondary ? theme.primary : 'white'};
  border: ${props => props.secondary ? `1px solid ${theme.border}` : 'none'};
  border-radius: 3px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
  flex: ${props => props.flex || '1'};
  margin: ${props => props.margin || '0'};
  position: relative;
  overflow: hidden;
  
  /* Add a subtle shadow for depth */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* Add ripple effect on click */
  &:active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple 0.6s linear;
  }
  
  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    80% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  /* Scale and shadow on hover */
  &:hover {
    background-color: ${props => props.disabled ? theme.border : props.secondary ? theme.border : theme.accent};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Scale animation on click */
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0.75rem;
  width: 100%;
  
  /* Add a subtle animation when the button group loads */
  & ${Button} {
    opacity: 0;
    transform: translateY(10px);
    animation: fadeInUp 0.5s forwards;
  }
  
  & ${Button}:nth-child(2) {
    animation-delay: 0.1s;
  }
  
  & ${Button}:nth-child(3) {
    animation-delay: 0.2s;
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageCaption = styled.div`
  font-size: 12px;
  color: ${theme.textLight};
  text-align: center;
  margin-top: 8px;
`;

// Main Component
const PointSelector = ({ imageData, sessionId, onScaleFactorsCalculated }) => {
  // Fixed canvas dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  
  // State declarations
  const [points, setPoints] = useState([]);
  const [step, setStep] = useState(1); // 1-4: Points selection steps
  const [xLength, setXLength] = useState('');
  const [yLength, setYLength] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [loadedImageUrl, setLoadedImageUrl] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Debug information will appear here');
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [isOverPoint, setIsOverPoint] = useState(false);
  
  // Refs
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const debugInfoRef = useRef('Debug information will appear here');
  
  // Memoized values
  const pointColors = useMemo(() => ['#c62828', '#f57c00', '#1565c0', '#6a1b9a'], []);
  
  // Point detection radius (how close to a point you need to be to select it)
  const POINT_RADIUS = 5;
  const DETECTION_RADIUS = 10;
  
  // Debug helper function
  const addDebugInfo = useCallback((message) => {
    console.log(message);
    const newInfo = `${debugInfoRef.current}\n${new Date().toLocaleTimeString()}: ${message}`;
    debugInfoRef.current = newInfo;
    setDebugInfo(newInfo);
  }, []);
  
  // Load image URL from session data
  useEffect(() => {
    if (!sessionId) return;
    
    addDebugInfo(`Loading session data for ID: ${sessionId}`);
    
    // Fetch session data from backend
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/session/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          addDebugInfo(`Received session data`);
          
          // Set image URL from resized path
          if (data.resized_path) {
            const path = data.resized_path;
            
            try {
              const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
              const filename = path.substring(lastSlashIndex + 1);
              const imageUrl = `http://localhost:5000/static/resized/${filename}`;
              
              setLoadedImageUrl(imageUrl);
              addDebugInfo(`Using image URL: ${imageUrl}`);
            } catch (err) {
              addDebugInfo(`Error processing path: ${err.message}`);
              setImageLoadError(true);
            }
          } else {
            addDebugInfo(`No resized_path in session data`);
            setImageLoadError(true);
          }
        } else {
          const errorText = await response.text();
          addDebugInfo(`Failed to fetch session data: ${errorText}`);
          setImageLoadError(true);
        }
      } catch (err) {
        addDebugInfo(`Error fetching session data: ${err.message}`);
        setImageLoadError(true);
      }
    };

    fetchSessionData();
  }, [sessionId, addDebugInfo]);
  
  // Handle image errors
  const handleImageError = useCallback((e) => {
    addDebugInfo(`Image load error: ${e.target.src}`);
    setImageLoadError(true);
    
    // Try direct URL as fallback
    const directUrl = `http://localhost:5000/direct-resized/${e.target.src.split('/').pop()}`;
    if (e.target.src !== directUrl) {
      addDebugInfo(`Retrying with direct URL: ${directUrl}`);
      e.target.src = directUrl;
    }
  }, [addDebugInfo]);
  
  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      addDebugInfo(`Image loaded: ${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`);
      setImageLoadError(false);
    }
  }, [addDebugInfo]);
  
  // Helper function to check distance between points
  const getDistance = useCallback((x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);
  
  // Find the index of a point at coordinates or -1 if not found
  const findPointAtCoordinates = useCallback((x, y) => {
    for (let i = 0; i < points.length; i++) {
      const distance = getDistance(points[i].x, points[i].y, x, y);
      if (distance <= DETECTION_RADIUS) {
        return i;
      }
    }
    return -1;
  }, [points, getDistance]);
  
  // Check if cursor is over any point
  const checkIfOverPoint = useCallback((x, y) => {
    const pointIndex = findPointAtCoordinates(x, y);
    return pointIndex !== -1;
  }, [findPointAtCoordinates]);
  
  // Draw points on canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw points and lines
    points.forEach((point, index) => {
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = pointColors[index % pointColors.length];
      ctx.fill();
      
      // Draw connecting lines and labels for measurements
      if (index === 1 && points.length >= 2) {
        // X direction line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.strokeStyle = pointColors[0];
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // X distance in pixels
        const xPixels = Math.abs(points[1].x - points[0].x);
        
        // Draw X measurement label
        const xMidpoint = (points[0].x + points[1].x) / 2;
        const yOffset = points[0].y + 15;
        
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${xPixels.toFixed(0)}px`, xMidpoint, yOffset);
        
        if (xLength) {
          const xScaleFactor = parseFloat(xLength) / xPixels;
          ctx.fillText(`${xScaleFactor.toFixed(4)} ft/px`, xMidpoint, yOffset + 15);
        }
      }
      
      if (index === 3 && points.length >= 4) {
        // Y direction line
        ctx.beginPath();
        ctx.moveTo(points[2].x, points[2].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.strokeStyle = pointColors[2];
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Y distance in pixels
        const yPixels = Math.abs(points[3].y - points[2].y);
        
        // Draw Y measurement label
        const xOffset = points[2].x - 15;
        const yMidpoint = (points[2].y + points[3].y) / 2;
        
        ctx.save();
        ctx.translate(xOffset, yMidpoint);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${yPixels.toFixed(0)}px`, 0, 0);
        
        if (yLength) {
          const yScaleFactor = parseFloat(yLength) / yPixels;
          ctx.fillText(`${yScaleFactor.toFixed(4)} ft/px`, 0, 15);
        }
        ctx.restore();
      }
      
      // Draw point label
      ctx.font = '12px Arial';
      ctx.fillStyle = pointColors[index % pointColors.length];
      ctx.fillText(index + 1, point.x + 10, point.y - 10);
    });
  }, [points, pointColors, xLength, yLength, CANVAS_WIDTH, CANVAS_HEIGHT, POINT_RADIUS]);
  
  // Update canvas when points change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, points]);
  
  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);
  
  // Keep coordinates within canvas boundaries
  const constrainToBounds = useCallback((x, y) => {
    return {
      x: Math.max(0, Math.min(x, CANVAS_WIDTH)),
      y: Math.max(0, Math.min(y, CANVAS_HEIGHT))
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    if (calculating || imageLoadError) return;
    
    const { x, y } = getCanvasCoordinates(e);
    const pointIndex = findPointAtCoordinates(x, y);
    
    if (pointIndex !== -1) {
      // Start dragging existing point
      setIsDragging(true);
      setDragIndex(pointIndex);
      addDebugInfo(`Started dragging point ${pointIndex + 1}`);
    } else if (step <= 4) {
      // Add new point if we're still in point selection phase
      const constrained = constrainToBounds(x, y);
      setPoints(prevPoints => [...prevPoints, constrained]);
      setStep(prevStep => prevStep + 1);
      addDebugInfo(`Added new point at (${constrained.x.toFixed(1)}, ${constrained.y.toFixed(1)}), step ${step}`);
    }
  }, [calculating, imageLoadError, getCanvasCoordinates, findPointAtCoordinates, step, constrainToBounds, addDebugInfo]);
  
  const handleMouseMove = useCallback((e) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (isDragging && dragIndex !== null) {
      // Update point position while dragging
      const constrained = constrainToBounds(x, y);
      setPoints(prevPoints => 
        prevPoints.map((point, index) => 
          index === dragIndex ? constrained : point
        )
      );
    } else {
      // Check if hovering over a point to update cursor
      const isHovering = checkIfOverPoint(x, y);
      setIsOverPoint(isHovering);
    }
  }, [isDragging, dragIndex, getCanvasCoordinates, constrainToBounds, checkIfOverPoint]);
  
  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      const { x, y } = getCanvasCoordinates(e);
      addDebugInfo(`Finished dragging point ${dragIndex + 1} to (${x.toFixed(1)}, ${y.toFixed(1)})`);
      setIsDragging(false);
      setDragIndex(null);
    }
  }, [isDragging, dragIndex, getCanvasCoordinates, addDebugInfo]);
  
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragIndex(null);
      addDebugInfo('Mouse left canvas area while dragging');
    }
    setIsOverPoint(false);
  }, [isDragging, addDebugInfo]);
  
  // Calculate scale factors
  const handleCalculateScaleFactors = async () => {
    if (points.length !== 4 || !xLength || !yLength) {
      setError('Please select 4 points and enter lengths for both directions');
      return;
    }
    
    setCalculating(true);
    setError('');
    
    addDebugInfo(`Calculating scale factors with X=${xLength}ft, Y=${yLength}ft`);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/calculate-scale`, {
        sessionId,
        points: points,
        x_length_feet: parseFloat(xLength),
        y_length_feet: parseFloat(yLength)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addDebugInfo(`Scale factors calculated: X=${data.scale_x}, Y=${data.scale_y}`);
        onScaleFactorsCalculated(data.scale_x, data.scale_y);
      } else {
        setError(data.error || 'Error calculating scale factors');
        addDebugInfo(`Error: ${data.error}`);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      addDebugInfo(`Network error: ${err.message}`);
    } finally {
      setCalculating(false);
    }
  };
  
  // Reset points
  const resetPoints = useCallback(() => {
    setPoints([]);
    setStep(1);
    setError('');
    addDebugInfo('Points reset');
  }, [addDebugInfo]);
  
  // Get step instructions
  const getStepInstructions = useMemo(() => {
    switch (step) {
      case 1: return "Select the first point of a known distance in X direction";
      case 2: return "Select the second point of the known distance in X direction";
      case 3: return "Select the first point of a known distance in Y direction";
      case 4: return "Select the second point of the known distance in Y direction";
      default: return "Enter the actual measurements and calculate scale factors";
    }
  }, [step]);
  
  // Try alternative image URL
  const tryAlternativeUrl = useCallback(() => {
    if (!loadedImageUrl) return;
    
    const filename = loadedImageUrl.split('/').pop();
    const alternativeUrl = `http://localhost:5000/direct-resized/${filename}`;
    
    addDebugInfo(`Trying alternative URL: ${alternativeUrl}`);
    setLoadedImageUrl(alternativeUrl);
    setImageLoadError(false);
  }, [loadedImageUrl, addDebugInfo]);

  return (
    <MainLayout>
      <ContentRow>
        {/* Left column - Controls */}
        <LeftColumn>
          <InstructionPanel>
            <h3>Floor Measurement Calibration</h3>
            <p>Select reference points on the floor plan to establish scale in both X and Y directions.</p>
            
            {[1, 2, 3, 4].map(stepNum => (
              <StepIndicator key={stepNum}>
                <StepNumber active={step === stepNum || step > 4}>{stepNum}</StepNumber>
                <div>
                  {step === stepNum ? (
                    <strong>
                      {stepNum <= 2 ? `Select ${stepNum === 1 ? 'first' : 'second'} X point` : 
                                     `Select ${stepNum === 3 ? 'first' : 'second'} Y point`}
                    </strong>
                  ) : (
                    <>
                      {stepNum <= 2 ? `Select ${stepNum === 1 ? 'first' : 'second'} X point` : 
                                    `Select ${stepNum === 3 ? 'first' : 'second'} Y point`}
                    </>
                  )}
                </div>
              </StepIndicator>
            ))}
            
            <div style={{ marginTop: '0.75rem', color: theme.primary, fontWeight: 500 }}>
              Current step: {getStepInstructions}
            </div>
            
            {points.length > 0 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: theme.textLight }}>
                <strong>Pro tip:</strong> You can drag points to adjust their position after placement.
              </div>
            )}
          </InstructionPanel>
          
          {/* Points List */}
          {/* {points.length > 0 && (
            <PointList>
              <h4>Reference Points</h4>
              {points.map((point, index) => (
                <PointListItem key={index} highlight={index === dragIndex}>
                  <div>
                    <ColorBox color={pointColors[index % pointColors.length]} />
                    Point {index + 1}: {index < 2 ? "X-axis" : "Y-axis"}
                  </div>
                  <div>
                    X: {Math.round(point.x)}, Y: {Math.round(point.y)}
                  </div>
                </PointListItem>
              ))}
            </PointList>
          )} */}
          
          {/* Measurement inputs */}
          {points.length >= 4 && (
            <InputContainer>
              <InputGroup>
                <Label htmlFor="xLength">X Distance (feet)</Label>
                <Input
                  id="xLength"
                  type="number"
                  value={xLength}
                  onChange={(e) => setXLength(e.target.value)}
                  placeholder="Enter X measurement"
                  step="0.01"
                  min="0"
                />
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="yLength">Y Distance (feet)</Label>
                <Input
                  id="yLength"
                  type="number"
                  value={yLength}
                  onChange={(e) => setYLength(e.target.value)}
                  placeholder="Enter Y measurement"
                  step="0.01"
                  min="0"
                />
              </InputGroup>
            </InputContainer>
          )}
          
          {/* Error message */}
          {error && (
            <div style={{
              color: theme.error,
              padding: '0.5rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem', 
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          {/* Button group */}
          <ButtonGroup>
            <Button 
              secondary
              onClick={resetPoints}
              flex="2"
            >
              Reset Points
            </Button>

            <Button 
              onClick={handleCalculateScaleFactors} 
              disabled={calculating || points.length < 4 || !xLength || !yLength}
              flex="2"
            >
              {calculating ? 'Calculating...' : 'Calculate Scale Factors'}
            </Button>
          </ButtonGroup>
        </LeftColumn>
        
        {/* Right column - Image and Canvas */}
        <RightColumn>
          <ImageContainer>
            {imageLoadError ? (
              <ErrorMessage>
                Failed to load image. Please check the session ID or try an alternative URL.
                <br />
                <Button 
                  onClick={tryAlternativeUrl}
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                >
                  Try Alternative URL
                </Button>
              </ErrorMessage>
            ) : loadedImageUrl ? (
              <>
                <StyledImage 
                  src={loadedImageUrl} 
                  alt="Floor plan" 
                  ref={imageRef}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <CanvasOverlay 
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
              </>
            ) : (
              <ErrorMessage>
                Loading image...
              </ErrorMessage>
            )}
          </ImageContainer>
          <ImageCaption>
            Click on the floor plan to select reference points. Use known dimensions like walls or doors.
          </ImageCaption>
        </RightColumn>
      </ContentRow>
    </MainLayout>
  );
};

export default PointSelector;