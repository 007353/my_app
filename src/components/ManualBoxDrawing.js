// frontend/my-app/src/components/ManualBoxDrawing.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Reuse the theme from DetectionResults for visual consistency
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
  danger: '#e74c3c',        // Red for delete actions
  warning: '#f39c12',       // Orange for warnings
};

// Define class options with their colors
const CLASS_OPTIONS = [
  { value: 'wall', label: 'Wall', color: 'green' },
   { value: 'door', label: 'Door', color: 'brown' },
  { value: 'window', label: 'Window', color: 'orange' },
   { value: 'slider', label: 'Sliding Door', color: 'purple' },
   { value: 'armchair', label: 'Armchair', color: 'darkblue' },
  { value: 'centertable', label: 'Center Table', color: 'darkred' },
  { value: 'diningtable', label: 'Dining Table', color: 'coral' },
  { value: 'gasstove', label: 'Gas Stove', color: 'magenta' },
  { value: 'largesofa', label: 'Large Sofa', color: 'red' },
  { value: 'sidetable', label: 'Side Table', color: 'khaki' },
  { value: 'toiletseat', label: 'Toilet Seat', color: 'blue' },
  { value: 'washbasin', label: 'Washbasin', color: 'green' },
  { value: 'bed', label: 'Bed', color: '#E34234' },
  { value: 'fridge', label: 'Fridge', color: 'black' },
  { value: 'sink', label: 'Sink', color: 'mediumseagreen' },
  { value: 'tv', label: 'TV', color: 'cyan' },
  { value: 'wardrobe', label: 'Wardrobe', color: 'purple' },
];

// Component styling
const DrawingContainer = styled.div`
  background: ${theme.light};
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  margin-top: 2rem;
  grid-column: 1 / -1;
`;

const ToolHeader = styled.h3`
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
`;

const CanvasContainer = styled.div`
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

const DrawingCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  cursor: crosshair;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem;
  background: ${theme.lightAlt};
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 900px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const ClassSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  min-width: 150px;
  
  &:focus {
    border-color: ${theme.accent};
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => 
    props.danger ? theme.danger : 
    props.warning ? theme.warning : 
    props.success ? theme.success : 
    theme.accent};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BoxListContainer = styled.div`
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid ${theme.border};
`;

const BoxListTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${theme.border};
  }
  
  th {
    background-color: ${theme.light};
    color: ${theme.primary};
    font-weight: 600;
  }
  
  tr:hover {
    background-color: ${theme.lightAlt};
  }
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  display: inline-block;
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${theme.danger};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
`;

// Add a background image container
const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  z-index: 10; // Below the drawing canvas
`;

const InstructionsPanel = styled.div`
  background: ${theme.lightAlt};
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid ${theme.accent};
  
  h4 {
    color: ${theme.primary};
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.9rem;
    color: ${theme.textLight};
  }
  
  li {
    margin-bottom: 0.25rem;
  }
`;

const ClassOptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const ClassOptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  border: 2px solid ${props => props.selected ? props.color : 'transparent'};
  background-color: ${props => `${props.color}22`}; // Very light background
  color: ${theme.text};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.color};
    background-color: ${props => `${props.color}33`}; // Slightly darker on hover
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// Component definition
const ManualBoxDrawing = ({ imageUrl, onBoxesChange, existingBoxes = [] }) => {
  // References
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // State
  const [selectedClass, setSelectedClass] = useState('wall');
  const [isDrawing, setIsDrawing] = useState(false);
  const [boxes, setBoxes] = useState(existingBoxes);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Add message state for instructions/feedback
  const [message, setMessage] = useState(null);
  const [displayInstructions, setDisplayInstructions] = useState(true);
  
  // Group class options by type
  const wallDoorOptions = CLASS_OPTIONS.filter(option => 
    ['wall', 'door', 'window', 'slider'].includes(option.value)
  );
  
  const furnitureOptions = CLASS_OPTIONS.filter(option => 
    !['wall', 'door', 'window', 'slider'].includes(option.value)
  );
  
  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      imageRef.current = image;
      setImageLoaded(true);
    };
  }, [imageUrl]);
  
  // Initialize canvas when component mounts or image changes
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all boxes
    drawAllBoxes();
  }, [imageLoaded, boxes]);
  
  // Notify parent of box changes
  useEffect(() => {
    if (onBoxesChange) {
      onBoxesChange(boxes);
    }
  }, [boxes, onBoxesChange]);
  
  // Get color for class
  const getColorForClass = useCallback((className) => {
    const classOption = CLASS_OPTIONS.find(option => option.value === className);
    return classOption ? classOption.color : 'gray';
  }, []);
  
  // Draw all boxes on canvas
  const drawAllBoxes = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each box
    boxes.forEach(box => {
      const color = getColorForClass(box.class);
      
      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Fill with semi-transparent color
      ctx.fillStyle = `${color}33`; // 20% opacity
      ctx.fillRect(box.x, box.y, box.width, box.height);
      
      // Draw label
      ctx.fillStyle = color;
      ctx.font = '16px Arial';
      const labelY = box.y > 20 ? box.y - 5 : box.y + 20;
      ctx.fillText(box.class, box.x, labelY);
    });
    
    // Draw current box being drawn
    if (currentBox) {
      const color = getColorForClass(selectedClass);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]); // Dashed line for current drawing
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
      ctx.setLineDash([]); // Reset to solid line
    }
  }, [boxes, currentBox, selectedClass, getColorForClass]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({
      x,
      y,
      width: 0,
      height: 0,
      class: selectedClass
    });
  }, [selectedClass]);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    
    // Calculate width and height
    const width = x - startPoint.x;
    const height = y - startPoint.y;
    
    // Update current box
    setCurrentBox({
      x: width >= 0 ? startPoint.x : x,
      y: height >= 0 ? startPoint.y : y,
      width: Math.abs(width),
      height: Math.abs(height),
      class: selectedClass
    });
    
    // Redraw
    drawAllBoxes();
  }, [isDrawing, startPoint, selectedClass, drawAllBoxes]);
  
  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    
    // Minimum box size check
    if (currentBox && currentBox.width > 5 && currentBox.height > 5) {
      // Add to boxes list
      setBoxes(prevBoxes => [...prevBoxes, {
        ...currentBox,
        id: Date.now().toString() // Generate a unique ID
      }]);
    }
    
    // Reset drawing state
    setIsDrawing(false);
    setCurrentBox(null);
    drawAllBoxes();
  }, [isDrawing, currentBox, drawAllBoxes]);
  
  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);
  
  // Add overlay effect to show what class is selected
  useEffect(() => {
    const classInfo = CLASS_OPTIONS.find(c => c.value === selectedClass);
    if (classInfo) {
      setMessage(`Drawing: ${classInfo.label} (${classInfo.color})`);
      
      // Clear message after 2 seconds
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedClass]);
  
  // Handle class selection change - updated to use direct value
  const handleClassChange = useCallback((className) => {
    setSelectedClass(className);
  }, []);
  
  // Delete a box
  const handleDeleteBox = useCallback((boxId) => {
    setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== boxId));
  }, []);
  
  // Clear all boxes
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all boxes?')) {
      setBoxes([]);
    }
  }, []);
  
  // Export boxes as JSON
  const handleExport = useCallback(() => {
    // Create a formatted JSON string
    const boxesData = boxes.map(box => ({
      class: box.class,
      type: ['wall', 'door', 'window', 'slider'].includes(box.class) ? 'wall_door' : 'furniture',
      confidence: 1.0, // User-drawn boxes get 100% confidence
      box: {
        x1: box.x,
        y1: box.y,
        width: box.width,
        height: box.height
      }
    }));
    
    // Create a data URL and trigger download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boxesData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "manual_annotations.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [boxes]);
  
  // Toggle instructions
  const toggleInstructions = useCallback(() => {
    setDisplayInstructions(prev => !prev);
  }, []);
  
  return (
    <DrawingContainer>
      <ToolHeader>Manual Box Drawing Tool</ToolHeader>
      
      <ActionButton 
        onClick={toggleInstructions}
        style={{ marginBottom: '1rem' }}
      >
        {displayInstructions ? 'Hide Instructions' : 'Show Instructions'}
      </ActionButton>
      
      {displayInstructions && (
        <InstructionsPanel>
          <h4>How to use the drawing tool:</h4>
          <ul>
            <li>Select a class from the options below</li>
            <li>Click and drag on the image to draw a bounding box</li>
            <li>Release the mouse button to finalize the box</li>
            <li>Each box is automatically colored based on its class</li>
            <li>Use the table below to view or delete your annotations</li>
            <li>Click "Export Combined" to merge with AI detections</li>
          </ul>
        </InstructionsPanel>
      )}
      
      <ControlBar>
        <ControlGroup style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <label style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Wall & Door Types:</label>
          <ClassOptionsList>
            {wallDoorOptions.map(option => (
              <ClassOptionButton 
                key={option.value}
                color={option.color}
                selected={selectedClass === option.value}
                onClick={() => handleClassChange(option.value)}
              >
                <ColorSwatch color={option.color} style={{ width: '12px', height: '12px' }} />
                {option.label}
              </ClassOptionButton>
            ))}
          </ClassOptionsList>
          
          <label style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Furniture Types:</label>
          <ClassOptionsList>
            {furnitureOptions.map(option => (
              <ClassOptionButton 
                key={option.value}
                color={option.color}
                selected={selectedClass === option.value}
                onClick={() => handleClassChange(option.value)}
              >
                <ColorSwatch color={option.color} style={{ width: '12px', height: '12px' }} />
                {option.label}
              </ClassOptionButton>
            ))}
          </ClassOptionsList>
        </ControlGroup>
        
        <ControlGroup>
          <ActionButton 
            warning
            onClick={handleClearAll}
            disabled={boxes.length === 0}
          >
            Clear All
          </ActionButton>
          
          <ActionButton 
            success
            onClick={handleExport}
            disabled={boxes.length === 0}
          >
            Export JSON
          </ActionButton>
        </ControlGroup>
      </ControlBar>
      
      {message && (
        <div style={{ 
          padding: '0.5rem', 
          margin: '0.5rem 0', 
          background: '#f8f9fa', 
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}
      
      <CanvasContainer ref={containerRef}>
        {/* Display the background image */}
        {imageUrl && <BackgroundImage src={imageUrl} alt="Background" />}
        
        <DrawingCanvas 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </CanvasContainer>
      
      {boxes.length > 0 ? (
        <BoxListContainer>
          <BoxListTable>
            <thead>
              <tr>
                <th>Class</th>
                <th>Position</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boxes.map(box => (
                <tr key={box.id}>
                  <td>
                    <ColorSwatch color={getColorForClass(box.class)} />
                    {box.class}
                  </td>
                  <td>x: {box.x}, y: {box.y}</td>
                  <td>{box.width} × {box.height}</td>
                  <td>
                    <DeleteButton onClick={() => handleDeleteBox(box.id)}>
                      Delete
                    </DeleteButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </BoxListTable>
        </BoxListContainer>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem', 
          color: theme.textLight,
          fontStyle: 'italic'
        }}>
          No boxes drawn yet. Select a class and draw on the image.
        </div>
      )}
    </DrawingContainer>
  );
};

export default ManualBoxDrawing; 