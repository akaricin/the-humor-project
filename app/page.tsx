import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: images } = await supabase.from("images").select("*");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">The Humor Project</h1>
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
