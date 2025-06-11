// src/utils/imageUtils.js - Helper functions for image dimension verification and frontend checks

/**
 * Verify image dimensions are 800x600
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<boolean>} - True if dimensions match, false otherwise
 */
export const verifyImageDimensions = (base64Image) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image dimensions: ${img.width}x${img.height}`);
        resolve(img.width === 800 && img.height === 600);
      };
      img.onerror = () => {
        console.error('Error loading image for dimension verification');
        resolve(false);
      };
      img.src = `data:image/jpeg;base64,${base64Image}`;
    });
  };
  
  /**
   * Report image dimension mismatch to user
   * @param {string} base64Image - Base64 encoded image
   * @param {function} setError - Function to set error state
   * @returns {Promise<boolean>} - True if dimensions are correct
   */
  export const checkAndReportDimensions = async (base64Image, setError) => {
    const isCorrectSize = await verifyImageDimensions(base64Image);
    if (!isCorrectSize) {
      console.warn('Image dimensions are not 800x600. The server should have resized it, but verification failed.');
      setError('Warning: Image dimensions may not be exactly 800x600. Scale factors might be affected.');
      return false;
    }
    return true;
  };
  
  /**
   * Convert image to 800x600 on client side if needed
   * Note: This is a fallback only. The server should handle all resizing.
   * @param {File} file - The image file to check
   * @returns {Promise<string>} - Base64 representation of the resized image
   */
  export const ensureImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Check if already 800x600
          if (img.width === 800 && img.height === 600) {
            console.log('Image is already 800x600, no client-side resize needed');
            resolve(e.target.result.split(',')[1]); // Return base64 without header
            return;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          
          // Calculate aspect ratios
          const imgAspect = img.width / img.height;
          const targetAspect = 800 / 600;
          
          let sx, sy, sWidth, sHeight;
          
          if (imgAspect > targetAspect) {
            // Image is wider than target - crop width
            sHeight = img.height;
            sWidth = img.height * targetAspect;
            sy = 0;
            sx = (img.width - sWidth) / 2;
          } else {
            // Image is taller than target - crop height
            sWidth = img.width;
            sHeight = img.width / targetAspect;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }
          
          // Draw resized image
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 800, 600);
          
          // Convert back to base64
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
          
          console.log('Image resized client-side to 800x600');
          resolve(resizedBase64);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for client-side resizing'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Log image dimensions to console
   * @param {string} base64Image - Base64 encoded image
   * @param {string} label - Label for logging
   */
  export const logImageDimensions = (base64Image, label = 'Image') => {
    const img = new Image();
    img.onload = () => {
      console.log(`${label} dimensions: ${img.width}x${img.height}`);
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  };
  
  /**
   * Calculate ratio between pixels and real-world measurements
   * @param {number} realWorldLength - Length in real world (e.g., in cm)
   * @param {number} pixelLength - Length in pixels
   * @returns {number} - Ratio (units per pixel)
   */
  export const calculateScaleFactor = (realWorldLength, pixelLength) => {
    if (!pixelLength || pixelLength === 0) {
      throw new Error('Pixel length cannot be zero');
    }
    return realWorldLength / pixelLength;
  };
  
  /**
   * Calculate real-world distance between two points
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @param {number} scaleX - Scale factor for X axis (units per pixel)
   * @param {number} scaleY - Scale factor for Y axis (units per pixel)
   * @returns {number} - Distance in real world units
   */
  export const calculateRealDistance = (point1, point2, scaleX, scaleY) => {
    const dx = Math.abs(point2.x - point1.x) * scaleX;
    const dy = Math.abs(point2.y - point1.y) * scaleY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  /**
   * Convert feet to centimeters
   * @param {number} feet - Length in feet
   * @returns {number} - Length in centimeters
   */
  export const feetToCentimeters = (feet) => {
    return feet * 30.48;
  };
  
  /**
   * Convert centimeters to feet
   * @param {number} cm - Length in centimeters
   * @returns {number} - Length in feet
   */
  export const centimetersToFeet = (cm) => {
    return cm / 30.48;
  };