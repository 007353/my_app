import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';
import PointSelector from '../components/PointSelector';
import DetectionResults from '../components/DetectionResults';
import config from '../config';

/**
 * Styled components section
 * These components handle the UI styling using styled-components library
 * with responsive design for all screen sizes
 */

// Breakpoints for responsive design
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

// Full page wrapper to ensure the app takes the entire viewport
const FullPageWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
`;

// Background with gradient effect for visual appeal
const GradientBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -10;
  height: 100%;
  width: 100%;
  background: radial-gradient(circle at 20% 20%, #cfd9df, #e2ebf0, #f6f9fc);
  background-size: cover;
  background-position: center;
`;

// Main container for content
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 5%;
  
  ${media.tv} {
    max-width: 2000px;
    margin: 0 auto;
    padding: 0 8%;
  }
  
  ${media.mobile} {
    padding: 0 3%;
  }
`;

// Navigation bar at the top of the page
const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  /*background-color: rgba(255, 255, 255, 0.8); */
  backdrop-filter: blur(5px);

  ${media.tv} {
    padding: 1rem 4rem;
    max-width: 2000px;
    margin: 0 auto;
  }

  ${media.tablet} {
    padding: 0.75rem 1rem;
  }
  
  ${media.mobile} {
    padding: 0.5rem;
    flex-direction: row;
    gap: 0.5rem;
  }
`;

// Container for the logo in the navbar
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

// Logo styling with filters applied
const Logo = styled.img`
  height: 120px;
  margin-right: 0.75rem;
  filter: brightness(0.4) contrast(2.5) grayscale(1);
  
  ${media.tv} {
    height: 150px;
  }
  
  ${media.laptop} {
    height: 100px;
  }
  
  ${media.tablet} {
    height: 80px;
  }
  
  ${media.mobile} {
    height: 60px;
    margin-right: 0.5rem;
  }
`;

// Text next to the logo - currently commented out in the render
const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
  
  ${media.tv} {
    font-size: 1.75rem;
  }
  
  ${media.mobile} {
    font-size: 1rem;
  }
`;

// Support button in the navbar
const SupportButton = styled.button`
  background-color: rgba(162, 197, 212, 0.69);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  ${media.tv} {
    padding: 0.75rem 2rem;
    font-size: 1.2rem;
  }
  
  ${media.mobile} {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    width: 25%;
    justify-content: center;
  }
  
  /* Hover and active states for better UX */
  &:hover {
    background-color: #455a64;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Icon in the support button
const SupportIcon = styled.span`
  margin-left: 0.5rem;
  
  ${media.tv} {
    font-size: 1.2rem;
    margin-left: 0.75rem;
  }
`;

// Header section with title and subtitle
const Header = styled.header`
  text-align: center;
  margin: 2rem 0;
  width: 100%;
  position: relative;
  
  ${media.tv} {
    margin: 3rem 0;
  }
  
  ${media.mobile} {
    margin: 1rem 0;
  }
  
  /* Decorative underline after the header */
  &::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background-color: #607d8b;
    
    ${media.tv} {
      width: 100px;
      height: 3px;
      bottom: -1.5rem;
    }
    
    ${media.mobile} {
      width: 40px;
      height: 1px;
      bottom: -0.5rem;
    }
  }
`;

// Main title styling
const Title = styled.h1`
  color: #37474f;
  margin-bottom: 0.5rem;
  font-size: 2.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  ${media.tv} {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }
  
  ${media.laptop} {
    font-size: 2rem;
  }
  
  ${media.tablet} {
    font-size: 1.75rem;
  }
  
  ${media.mobile} {
    font-size: 1.25rem;
    margin-bottom: 0.3rem;
  }
`;

// Subtitle styling
const Subtitle = styled.p`
  color: #78909c;
  font-size: 1rem;
  letter-spacing: 0.5px;
  font-weight: 300;
  max-width: 800px;
  margin: 0 auto;
  
  ${media.tv} {
    font-size: 1.5rem;
    max-width: 1200px;
  }
  
  ${media.tablet} {
    font-size: 0.9rem;
    padding: 0 1rem;
  }
  
  ${media.mobile} {
    font-size: 0.8rem;
    padding: 0 0.5rem;
  }
`;

// Container for the loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  width: 90%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  
  ${media.tv} {
    max-width: 1200px;
    padding: 4rem;
  }
  
  ${media.tablet} {
    padding: 2rem;
    width: 95%;
  }
  
  ${media.mobile} {
    padding: 1.5rem;
    width: 100%;
  }
`;

// Loading spinner animation
const Spinner = styled.div`
  border: 3px solid #eceff1;
  border-top: 3px solid #607d8b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1.2s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
  margin-bottom: 1.5rem;

  ${media.tv} {
    width: 60px;
    height: 60px;
    border-width: 4px;
    margin-bottom: 2rem;
  }
  
  ${media.mobile} {
    width: 30px;
    height: 30px;
    border-width: 2px;
    margin-bottom: 1rem;
  }

  /* Spinner animation keyframes */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Progress bar container
const ProgressBar = styled.div`
  width: 90%;
  max-width: 500px;
  height: 6px;
  background: linear-gradient(to right, #eceff1, #f5f5f5);
  border-radius: 3px;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  
  ${media.tv} {
    max-width: 800px;
    height: 10px;
    margin-bottom: 3rem;
  }
  
  ${media.tablet} {
    width: 95%;
  }
  
  ${media.mobile} {
    height: 4px;
    margin-bottom: 1rem;
    width: 100%;
  }
`;

// Progress indicator that fills based on current step
const Progress = styled.div`
  height: 100%;
  width: ${props => props.step * (100 / 3)}%;
  background: linear-gradient(90deg, #546e7a, #78909c);
  transition: width 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  border-radius: 3px;
`;

// Step indicator showing the 3 steps of the process
const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  width: 90%;
  max-width: 500px;
  margin-bottom: 2rem;
  position: relative;

  ${media.tv} {
    max-width: 800px;
    margin-bottom: 3rem;
  }
  
  ${media.tablet} {
    width: 95%;
  }
  
  ${media.mobile} {
    margin-bottom: 1.5rem;
    width: 100%;
  }

  /* Horizontal line connecting steps */
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 50px;
    right: 50px;
    height: 1px;
    background-color: #cfd8dc;
    z-index: -1;
    
    ${media.tv} {
      top: 20px;
      height: 2px;
    }
    
    ${media.mobile} {
      top: 10px;
      left: 30px;
      right: 30px;
    }
  }
`;

// Individual step container
const Step = styled.div`
  text-align: center;
  width: 100px;
  position: relative;
  
  ${media.tv} {
    width: 150px;
  }
  
  ${media.mobile} {
    width: 80px;
  }
`;

// Step number circle with dynamic styling based on current state
const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#546e7a' : props.completed ? '#90a4ae' : '#eceff1'};
  color: ${props => props.active || props.completed ? 'white' : '#b0bec5'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  font-weight: 500;
  transition: all 0.5s;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(84, 110, 122, 0.4)' : 'none'};
  font-size: 0.875rem;
  
  ${media.tv} {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  ${media.mobile} {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    margin-bottom: 0.3rem;
  }
`;

// Step label with dynamic styling based on current state
const StepLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.active ? '#546e7a' : props.completed ? '#78909c' : '#b0bec5'};
  transition: color 0.5s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${props => props.active ? '500' : '400'};
  
  ${media.tv} {
    font-size: 1.1rem;
  }
  
  ${media.mobile} {
    font-size: 0.6rem;
    letter-spacing: 0;
  }
`;

// Footer at the bottom of the page
const Footer = styled.footer`
  width: 100%;
  background: #1e293b;
  color: #94a3b8;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  font-size: 0.875rem;
  
  ${media.tv} {
    padding: 2rem;
    font-size: 1.2rem;
  }
  
  ${media.mobile} {
    padding: 1rem;
    font-size: 0.75rem;
  }
  
  a {
    color: #60a5fa;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Footer content container
const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  
  ${media.tv} {
    max-width: 1800px;
  }
`;

// Error container styling
const ErrorContainer = styled.div`
  color: #e53935;
  text-align: center;
  margin: 1rem 0;
  width: 100%;
  max-width: 800px;
  background: rgba(255, 235, 238, 0.8);
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  ${media.tv} {
    max-width: 1200px;
    padding: 2rem;
    font-size: 1.2rem;
  }
  
  ${media.mobile} {
    padding: 1rem;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }
`;

// Try again button styling
const TryAgainButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  ${media.tv} {
    padding: 0.75rem 2.5rem;
    font-size: 1.2rem;
    margin-top: 1.5rem;
  }
  
  ${media.mobile} {
    padding: 0.4rem 1.2rem;
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }
  
  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * Main Home component
 * Handles the application state and workflow for the floor plan detection system
 */
const Home = () => {
  // State management for the multi-step process
  const [step, setStep] = useState(1);              // Current step in the workflow (1-3)
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null);          // Error handling
  const [imageData, setImageData] = useState(null);  // Base64 image data
  const [sessionId, setSessionId] = useState(null);  // Session ID for API calls
  const [scaleFactors, setScaleFactors] = useState(null); // Scale factors for image measurements
  const [results, setResults] = useState(null);      // Results from detection API
  const [showSupportModal, setShowSupportModal] = useState(false); // Support modal visibility (not implemented)

  /**
   * Handler for when an image is uploaded in step 1
   * @param {string} imageBase64 - Base64 encoded image data
   * @param {string} sessionId - Session ID from the server
   */
  const handleImageUploaded = async (imageBase64, sessionId) => {
    setImageData(imageBase64);
    setSessionId(sessionId);
    setStep(2); // Proceed to step 2 (scale definition)

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/process`, {
        image: imageBase64,
        sessionId: sessionId
      });
      // ... rest of the function
    } catch (error) {
      // ... error handling
    }
  };

  /**
   * Handler for when scale factors are calculated in step 2
   * Calls the detection API with the session ID
   * @param {number} scaleX - X-axis scale factor
   * @param {number} scaleY - Y-axis scale factor
   */
  const handleScaleFactorsCalculated = async (scaleX, scaleY) => {
    setScaleFactors({ x: scaleX, y: scaleY });
    setIsLoading(true);
    setError(null);
    
    try {
      // Make API call to detect objects in the floor plan
      const response = await axios.post('http://localhost:5000/api/detect', {
        session_id: sessionId
      });
      setResults(response.data);
      setStep(3); // Proceed to step 3 (results)
    } catch (err) {
      // Comprehensive error handling with specific messages
      if (err.response) {
        setError(`Server error: ${err.response?.data?.error || err.response.statusText}`);
      } else if (err.request) {
        setError('No response from server. Is the Flask server running?');
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler to restart the process with a new image
   * Resets all state variables
   */
  const handleNewImage = () => {
    setImageData(null);
    setSessionId(null);
    setScaleFactors(null);
    setResults(null);
    setStep(1); // Go back to step 1
  };

  /**
   * Handler for support button click
   * Currently just shows an alert, but could open a modal
   */
  const handleSupportClick = () => {
    // TODO: Implement proper support functionality instead of alert
    alert("Support functionality will be implemented here");
    // Or use a modal: setShowSupportModal(true);
  };

  /**
   * Renders the appropriate content based on current step and state
   * @returns {JSX.Element} - The component to render
   */
  const renderContent = () => {
    // Show loading state if API call is in progress
    if (isLoading) {
      return (
        <LoadingContainer>
          <Spinner />
          <p>Processing your image...</p>
          <p>This may take a few moments</p>
        </LoadingContainer>
      );
    }

    // Show error message if there was an error
    if (error) {
      return (
        <ErrorContainer>
          <p>{error}</p>
          <TryAgainButton onClick={handleNewImage}>
            Try Again
          </TryAgainButton>
        </ErrorContainer>
      );
    }

    // Render the appropriate component based on current step
    switch (step) {
      case 1:
        return <ImageUploader onImageUploaded={handleImageUploaded} isLoading={isLoading} />;
      case 2:
        return <PointSelector imageData={imageData} sessionId={sessionId} onScaleFactorsCalculated={handleScaleFactorsCalculated} />;
      case 3:
        return <DetectionResults results={results} onNewImage={handleNewImage} />;
      default:
        // Fallback to step 1 if step value is invalid
        return <ImageUploader onImageUploaded={handleImageUploaded} isLoading={isLoading} />;
    }
  };

  // Main component render
  return (
    <FullPageWrapper>
      {/* Fixed gradient background */}
      <GradientBackground />
      
      {/* Navigation bar */}
      <NavBar>
        <LogoContainer>
          <Logo src="/images/3456.png" alt="OneKnotOne Logo" />
          {/* LogoText component is defined but not used - uncomment if needed */}
          {/* <LogoText>OneKnotOne</LogoText> */}
        </LogoContainer>
        
        <SupportButton onClick={handleSupportClick}>
          Support
          <SupportIcon>💬</SupportIcon>
        </SupportButton>
      </NavBar>
      
      {/* Main content container */}
      <Container>
        {/* Page header with title and subtitle */}
        <Header>
          <Title>Floor Plan To 3D</Title>
          <Subtitle>
            Upload architectural floor plans, calibrate scale, and automatically identify furniture items with precision.
          </Subtitle>
        </Header>

        {/* Progress indicator components */}
        <ProgressBar>
          <Progress step={step} />
        </ProgressBar>

        <StepIndicator>
          {/* Step 1: Upload Image */}
          <Step>
            <StepNumber active={step === 1} completed={step > 1}>
              {step > 1 ? '✓' : '1'}
            </StepNumber>
            <StepLabel active={step === 1} completed={step > 1}>
              Upload Image
            </StepLabel>
          </Step>

          {/* Step 2: Define Room Scale */}
          <Step>
            <StepNumber active={step === 2} completed={step > 2}>
              {step > 2 ? '✓' : '2'}
            </StepNumber>
            <StepLabel active={step === 2} completed={step > 2}>
              Define Room Scale
            </StepLabel>
          </Step>

          {/* Step 3: Analyze & Visualize */}
          <Step>
            <StepNumber active={step === 3} completed={step > 3}>
              {step > 3 ? '✓' : '3'}
            </StepNumber>
            <StepLabel active={step === 3} completed={step > 3}>
              Analyze & Visualize
            </StepLabel>
          </Step>
        </StepIndicator>

        {/* Dynamic content based on current step */}
        {renderContent()}
      </Container>

      {/* Footer */}
      <Footer>
        <FooterContent>
          Floor Plan To 3D • Powered by OneKnotOne Technologies
        </FooterContent>
      </Footer>

    </FullPageWrapper>
  );
};

export default Home;