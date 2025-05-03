/**
 * Cloudinary configuration and utility functions
 */

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloud_name: 'di7j2lvnu',
  api_key: '128237449861368',
  upload_preset: 'ml_default',
  api_secret: 'hsgpMoshK_EJHfHwiPbDmtnv5Lc' // Note: In production, this should be on the server side only
};

/**
 * Sanitize a URL to ensure it's valid
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  // Return empty string if URL is undefined, null, or empty
  if (!url) return '';
  
  // Check if URL is valid
  try {
    // Try to create a URL object - will throw if the URL is invalid
    new URL(url);
    return url;
  } catch (e) {
    // If URL is invalid, check if it's a relative path
    if (url.startsWith('/')) {
      // Could be a relative URL - this might be valid in some contexts
      return url;
    }
    
    // Log error for debugging
    console.warn(`Invalid URL: ${url}`);
    return '';
  }
};

/**
 * Generate an optimized Cloudinary URL with transformations
 * @param url The original Cloudinary URL
 * @param options Transformation options
 * @returns Transformed Cloudinary URL
 */
export const getOptimizedUrl = (url: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'auto';
  quality?: number | 'auto';
  format?: 'auto' | 'jpg' | 'png' | 'webp';
} = {}): string => {
  // Sanitize the URL first
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) return '';
  
  // Check if this is a Cloudinary URL
  if (!sanitizedUrl.includes('cloudinary.com')) {
    return sanitizedUrl;
  }
  
  try {
    // Extract the public ID and version from the URL
    const parts = sanitizedUrl.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return sanitizedUrl;
    
    // Default transformations
    const transformations = [
      'f_auto', // Auto format
      options.quality ? (options.quality === 'auto' ? 'q_auto' : `q_${options.quality}`) : 'q_auto',
    ];
    
    // Add optional transformations
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    
    // Build the new URL with transformations
    const transformationString = transformations.join(',');
    
    // Create a copy of parts to avoid modifying the original array
    const newParts = [...parts];
    newParts.splice(uploadIndex + 1, 0, transformationString);
    
    return newParts.join('/');
  } catch (error) {
    console.error(`Error optimizing URL: ${sanitizedUrl}`, error);
    return sanitizedUrl; // Return original (sanitized) URL on error
  }
};

/**
 * Generate a responsive image URL for different screen sizes
 * @param url The original Cloudinary URL
 * @param screenWidth Current screen width
 * @returns Optimized URL for the screen size
 */
export const getResponsiveImageUrl = (url: string, screenWidth: number): string => {
  // Determine the best width based on screen size
  let width: number;
  if (screenWidth <= 576) width = 576;
  else if (screenWidth <= 768) width = 768;
  else if (screenWidth <= 992) width = 992;
  else if (screenWidth <= 1200) width = 1200;
  else width = 1600;
  
  return getOptimizedUrl(url, {
    width,
    quality: 'auto',
    format: 'auto',
    crop: 'fill'
  });
};

/**
 * Generate a Cloudinary upload signature
 * THIS SHOULD IDEALLY BE ON THE SERVER SIDE
 * For production, implement a server endpoint that generates signatures
 * 
 * @param params Parameters to include in the signature
 * @returns A signature string
 */
export const generateSignature = (params: Record<string, string | number>) => {
  // In a production app, this would be a call to your backend
  // which would generate and return the signature
  // This is a simplified example for demonstration only
  
  console.warn("WARNING: Generating signatures client-side is not secure for production!");
  
  // For demonstration purposes only - in real applications,
  // move this logic to your server
  const timestamp = Math.round(new Date().getTime() / 1000);
  return {
    signature: "generated_signature_placeholder",
    timestamp
  };
};

/**
 * Upload multiple images to Cloudinary with proper error handling
 * @param images Array of image URIs to upload
 * @param options Upload options
 * @returns Array of image URLs
 */
export const uploadMultipleImages = async (
  images: string[],
  options: {
    onProgress?: (progress: number) => void;
    folder?: string;
    tags?: string[];
  } = {}
): Promise<string[]> => {
  if (!images.length) {
    return [];
  }
  
  try {
    console.log(`Starting upload of ${images.length} images to Cloudinary...`);
    
    // Upload all images in parallel
    const uploadPromises = images.map(async (imageUri, index) => {
      console.log(`Uploading image ${index + 1}/${images.length}...`);
      
      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      
      // @ts-ignore
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      });
      
      // Add upload parameters
      formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
      formData.append('api_key', CLOUDINARY_CONFIG.api_key);
      formData.append('timestamp', String(Math.round(new Date().getTime() / 1000)));
      
      // Add optional parameters
      if (options.folder) formData.append('folder', options.folder);
      if (options.tags?.length) formData.append('tags', options.tags.join(','));
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.secure_url) {
        console.log(`Image ${index + 1} uploaded successfully:`, data.public_id);
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    });
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${results.length} images`);
    return results;
  } catch (error: any) {
    console.error("Error uploading images to Cloudinary:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}; 