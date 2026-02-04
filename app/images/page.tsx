"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function ImagesPage() {
  const [images, setImages] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("images").select("*");

      if (error) {
        console.error("Error fetching images:", error);
        setError("Error loading images.");
      } else {
        setImages(data);
      }
      setLoading(false);
    }

    fetchImages();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p>Loading images...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Image Gallery</h1>
      <p className="text-lg text-gray-600 mb-8">A collection of humorous images.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={image.url!} alt={image.image_description || ""} className="w-full h-48 object-cover rounded-md mb-4" />
            <p className="text-gray-800">{image.image_description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
