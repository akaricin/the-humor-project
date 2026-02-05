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
      <div className="table w-full border-separate border-spacing-y-4">
        <div className="table-header-group">
          <div className="table-row">
            <div className="table-cell text-left font-bold w-1/3">Image</div>
            <div className="table-cell text-left font-bold">Description</div>
          </div>
        </div>
        <div className="table-row-group">
          {images.map((image) => (
            <div key={image.id} className="table-row bg-white rounded-lg shadow-md">
              <div className="table-cell p-4 align-middle w-1/3">
                <img
                  src={image.url!}
                  alt={image.image_description || "Image"}
                  className="w-full h-auto min-w-[100px] max-w-xs object-cover rounded-md"
                />
              </div>
              <div className="table-cell p-4 align-middle">
                <p className="text-gray-800">{image.image_description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
