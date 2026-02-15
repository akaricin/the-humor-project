import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ImageGrid from "@/components/ImageGrid";
import { Database } from "@/types/supabase"; // Keep import for Database if createClient needs it

export default async function ImagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select("id, url, image_description")
    .eq("is_public", true);

  const images = data; // Let TypeScript infer the type, or cast if necessary after

  if (error) {
    console.error("Error fetching images:", error);
    notFound();
  }

  if (!images || images.length === 0) {
    return (
      <div className="p-10 bg-[#b1c5e7] min-h-screen block text-center">
        <p className="text-[18px] text-gray-800">No images found.</p>
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-[#b1c5e7]">
      <div className="w-full min-w-0 block"> {/* Add w-full here */}
        <h1 className="text-[50px] font-bold text-gray-800 mb-4">Image Gallery</h1>
        <p className="text-lg text-gray-600 mb-8">A collection of humorous images.</p>
        <ImageGrid images={images} />
      </div>
    </div>
  );
}
