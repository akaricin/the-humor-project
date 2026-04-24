"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Database } from "@/types/supabase";

type GalleryImage = Pick<Database['public']['Tables']['images']['Row'], 'id' | 'url' | 'image_description'>;

interface ImageGridProps {
  images: GalleryImage[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <>
      {/* START OF IMAGE_GRID_COMPONENT */}
      <div className="w-full">
        {/* IMAGE GRID: Forced 4-column layout via inline styles */}
        <div 
          className="custom-gallery-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px', 
            width: '100%',
            maxWidth: 'none'
          }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="gallery-item relative aspect-square cursor-pointer border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white overflow-hidden group"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.url!}
                alt={image.image_description || "Gallery Image"}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <p className="text-white text-center text-xl font-bold border-2 border-white p-2">
                  VIEW DETAILS
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POPUP: Strict Fixed-Size Architecture */}
      {mounted && selectedImage && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999999]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelectedImage(null)}
        >
          {/* FIXED WINDOW: 800px x 500px, overflow hidden */}
          <div 
            className="modal-content-split relative bg-[#f0f0f0] border-[10px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
            style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              width: '800px', 
              height: '500px', 
              overflow: 'hidden' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-red-500 text-white w-10 h-10 flex items-center justify-center font-bold border-4 border-black z-[100] hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="text-2xl">&times;</span>
            </button>

            {/* FIXED 50/50 SPLIT - Left Side: Image */}
            <div 
              className="border-r-[8px] border-black bg-gray-200"
              style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden' }}
            >
              <img
                src={selectedImage.url!}
                alt="Selected"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* FIXED 50/50 SPLIT - Right Side: Description */}
            <div 
              className="flex flex-col bg-white"
              style={{ width: '50%', height: '100%', padding: '20px', overflowY: 'auto' }}
            >
              <div className="mb-6">
                <h3 className="text-sm uppercase tracking-widest font-bold text-gray-400 mb-2 border-b-2 border-gray-100 pb-1">Image Description</h3>
                <p className="text-2xl font-black text-black leading-tight jersey-10-regular">
                  {selectedImage.image_description || "No description provided."}
                </p>
              </div>
              
              <div className="mt-auto pt-6 border-t-4 border-black border-dotted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black"></div>
                  <span className="text-xs font-bold uppercase tracking-tighter">Verified Content</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">UID: {selectedImage.id}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* END OF IMAGE_GRID_COMPONENT */}
    </>
  );
}
