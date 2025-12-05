/**
 * Image Optimization Utilities for Blog Posts
 * 
 * Utilities for optimizing and validating blog post images.
 */

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Recommended image sizes for blog posts
 */
export const RECOMMENDED_SIZES = {
  featuredImage: {
    width: 1200,
    height: 630,
    aspectRatio: 1200 / 630,
  },
  thumbnail: {
    width: 400,
    height: 300,
    aspectRatio: 400 / 300,
  },
  contentImage: {
    maxWidth: 1200,
    maxHeight: 800,
  },
};

/**
 * Get image dimensions from URL
 */
export async function getImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Check if image dimensions are optimal for featured images
 */
export function isOptimalFeaturedImageSize(dimensions: ImageDimensions): boolean {
  const { width, height } = dimensions;
  const { width: recWidth, height: recHeight } = RECOMMENDED_SIZES.featuredImage;
  
  // Allow some tolerance (±10%)
  const tolerance = 0.1;
  const widthMatch = Math.abs(width - recWidth) / recWidth <= tolerance;
  const heightMatch = Math.abs(height - recHeight) / recHeight <= tolerance;
  
  return widthMatch && heightMatch;
}

/**
 * Get image optimization recommendations
 */
export function getImageRecommendations(dimensions: ImageDimensions): string[] {
  const recommendations: string[] = [];
  const { width, height } = dimensions;
  const { width: recWidth, height: recHeight, aspectRatio } = RECOMMENDED_SIZES.featuredImage;
  
  // Check dimensions
  if (width < recWidth || height < recHeight) {
    recommendations.push(
      `Image is smaller than recommended (${recWidth}x${recHeight}). Consider using a larger image for better quality.`
    );
  }
  
  if (width > recWidth * 2 || height > recHeight * 2) {
    recommendations.push(
      `Image is much larger than needed. Consider resizing to improve page load times.`
    );
  }
  
  // Check aspect ratio
  const imageAspectRatio = width / height;
  const aspectRatioDiff = Math.abs(imageAspectRatio - aspectRatio);
  
  if (aspectRatioDiff > 0.1) {
    recommendations.push(
      `Image aspect ratio (${imageAspectRatio.toFixed(2)}) differs from recommended (${aspectRatio.toFixed(2)}). Image may be cropped when displayed.`
    );
  }
  
  return recommendations;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export async function validateBlogImage(
  file: File,
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    valid: true,
    warnings: [],
  };
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum of ${formatFileSize(maxSize)}.`,
    };
  }
  
  // Check dimensions
  try {
    const url = URL.createObjectURL(file);
    const dimensions = await getImageDimensions(url);
    URL.revokeObjectURL(url);
    
    const recommendations = getImageRecommendations(dimensions);
    if (recommendations.length > 0) {
      result.warnings = recommendations;
    }
  } catch {
    result.warnings?.push('Could not validate image dimensions.');
  }
  
  return result;
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Get optimized image URL with query parameters
 */
export interface ImageOptimizationParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export function getOptimizedImageUrl(
  url: string,
  params: ImageOptimizationParams
): string {
  const urlObj = new URL(url, window.location.origin);
  
  if (params.width) {
    urlObj.searchParams.set('w', params.width.toString());
  }
  
  if (params.height) {
    urlObj.searchParams.set('h', params.height.toString());
  }
  
  if (params.quality) {
    urlObj.searchParams.set('q', params.quality.toString());
  }
  
  if (params.format) {
    urlObj.searchParams.set('f', params.format);
  }
  
  return urlObj.toString();
}

/**
 * Compress image client-side before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 630,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}
