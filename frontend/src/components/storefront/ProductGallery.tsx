'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: string[];
  featuredImage?: string | null;
  productName: string;
}

export function ProductGallery({ images, featuredImage, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Combine featured image with other images
  const allImages = featuredImage
    ? [featuredImage, ...images.filter(img => img !== featuredImage)]
    : images.length > 0
    ? images
    : ['/placeholder-product.png']; // Fallback placeholder
  
  const currentImage = allImages[selectedImageIndex];
  
  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - next image
        handleNext();
      } else {
        // Swiped right - previous image
        handlePrevious();
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'Escape') setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedImageIndex]);
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-muted rounded-lg overflow-hidden group touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={currentImage}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            fill
            className={`object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-110' : 'scale-100'
            }`}
            priority={selectedImageIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            quality={90}
          />
        </div>
        
        {/* Zoom Icon Overlay - Hidden on mobile */}
        <div className="hidden sm:block absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5 text-foreground" />
        </div>
        
        {/* Navigation Arrows (if multiple images) */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all min-h-[44px] touch-manipulation ${
                selectedImageIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-muted-foreground/20'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 20vw, (max-width: 768px) 15vw, 10vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div 
            className="relative w-full h-full bg-background"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={currentImage}
              alt={`${productName} - Full size`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={95}
            />
            
            {/* Lightbox Navigation */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 min-h-[44px] min-w-[44px] touch-manipulation"
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 min-h-[44px] min-w-[44px] touch-manipulation"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
