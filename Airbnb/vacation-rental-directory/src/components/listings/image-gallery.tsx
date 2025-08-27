"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageGalleryProps {
  images: {
    url: string;
    alt?: string | null;
  }[];
  title?: string;
  featured?: boolean;
  className?: string;
}

export function ImageGallery({ images, title, featured, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images.length) {
    return (
      <div className={cn("aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center", className)}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Fullscreen modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeFullscreen}
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div className="relative max-w-6xl max-h-full">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || title || `Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-screen"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main gallery view
  if (images.length === 1) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={images[0].url}
            alt={images[0].alt || title || "Property image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
              Featured
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={openFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Multiple images layout
  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-4 gap-2 h-80">
        {/* Main image */}
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg group">
          <Image
            src={images[0].url}
            alt={images[0].alt || title || "Main property image"}
            fill
            className="object-cover cursor-pointer hover:brightness-90 transition-all"
            onClick={openFullscreen}
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
              Featured
            </Badge>
          )}
        </div>

        {/* Side images */}
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg group cursor-pointer"
          >
            <Image
              src={image.url}
              alt={image.alt || title || `Property image ${index + 2}`}
              fill
              className="object-cover hover:brightness-90 transition-all"
              onClick={() => {
                setCurrentIndex(index + 1);
                openFullscreen();
              }}
            />
            {index === 3 && images.length > 5 && (
              <div 
                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium hover:bg-black/70 transition-colors"
                onClick={() => {
                  setCurrentIndex(4);
                  openFullscreen();
                }}
              >
                +{images.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View all photos button */}
      <Button
        variant="secondary"
        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white"
        onClick={openFullscreen}
      >
        <Maximize2 className="h-4 w-4 mr-2" />
        View all {images.length} photos
      </Button>
    </div>
  );
}