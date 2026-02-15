"use client";

import { useState } from "react"; // Removed useEffect import
import { createPortal } from "react-dom"; // Import createPortal
import { Database } from "@/types/supabase"; // Import Database type

type GalleryImage = Pick<Database['public']['Tables']['images']['Row'], 'id' | 'url' | 'image_description'>; // Define GalleryImage type

interface ImageGridProps {
  images: GalleryImage[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  // Removed mounted state and useEffect hook

  return (
    <>
      {/* Outer wrapper */}
      <div className="w-full block">
        {/* The Grid Parent */}
        <div className="grid grid-cols-3 gap-10 w-full">
          {images.map((image) => (
            // The Image Cards (The Sharp Frame)
            <div
              key={image.id}
              className="relative aspect-square cursor-pointer border-[6px] border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
              onClick={() => { console.log('Image clicked:', image.id); setSelectedImage(image); }}
            >
              {/* The Image Styling */}
              <img
                src={image.url!}
                alt={image.image_description || "Image"}
                className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all"
              />
              {/* The Hover Feature (Description) */}
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-center font-bold text-xl">
                  {image.image_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Modal (Fullscreen) - Rendered via Portal */}
      {selectedImage && typeof window !== 'undefined' && createPortal( // Conditional on window being defined
        // The Backdrop
        <div
          className="fixed inset-0 w-screen h-screen bg-black/95 flex items-center justify-center !z-[99999]"
          onClick={() => setSelectedImage(null)} // Click outside to close
        >
          {/* The Window */}
          <div
            className="relative bg-white border-[8px] border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] flex overflow-hidden"
            style={{ width: '1000px', height: '400px' }} // Inline styles for exact dimensions
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* The Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-black text-white w-10 h-10 flex items-center justify-center font-bold border-2 border-white z-[101]"
            >
              &times;
            </button>

            {/* Split-Screen Layout */}
            {/* Left Side (Image) */}
            <div className="w-1/2 h-full border-r-[8px] border-black">
              <img
                src={selectedImage.url!}
                alt={selectedImage.image_description || "Image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side (Text) */}
            <div className="w-1/2 h-full bg-[#FEFEFA] flex flex-col justify-center overflow-hidden">
              <div className="p-4 h-full w-full flex flex-col overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Description</h3>
                <p className="text-xl font-black text-black leading-relaxed pb-4">
                  {selectedImage.image_description}
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body // Portal target
      )}
    </>
  );
}
