import { getSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function ImagesPage() {
  const supabase = getSupabaseClient();
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, image_description")
    .eq("is_public", true);

  if (error) {
    console.error("Error fetching images:", error);
    // This will render the not-found page, which is a good way to handle critical data fetching errors
    notFound();
  }

  if (!images) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p>No images found.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Image Gallery</h1>
      <p className="text-lg text-gray-600 mb-8">
        A collection of humorous images.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col"
          >
            <div className="w-full h-48 mb-4">
              <img
                src={image.url!}
                alt={image.image_description || "Image"}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <p className="text-gray-800">{image.image_description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
