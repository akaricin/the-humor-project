"use client";

import { useState } from "react";
import { Database } from "@/types/supabase"; // Import Database type

type GalleryImage = Pick<Database['public']['Tables']['images']['Row'], 'id' | 'url' | 'image_description'>; // Define GalleryImage type

interface ImageGridProps {
  images: GalleryImage[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <>
      {/* The Grid Parent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {images.map((image) => (
          // The Image Cards
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-md cursor-pointer group"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url!}
              alt={image.image_description || "Image"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* The Modal (Click to Expand) */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-[#FEFEFA] text-4xl font-bold hover:opacity-70"
          >
            &times;
          </button>

          {/* Expanded Image */}
          <img
            src={selectedImage.url!}
            alt={selectedImage.image_description || "Image"}
            className="max-w-4xl max-h-[70vh] object-contain rounded-lg"
          />

          {/* Description */}
          <p className="text-[#FEFEFA] text-2xl mt-6 font-bold text-center px-4">
            {selectedImage.image_description}
          </p>
        </div>
      )}
    </>
  );
}