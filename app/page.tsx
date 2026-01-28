export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-5xl font-bold text-gray-800">Hello World!</h1>
      <p className="mt-4 text-lg text-gray-600">Here are some funny memes:</p>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <img
            src="https://placehold.co/400x300"
            alt="Funny Meme 1"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <img
            src="https://placehold.co/400x300"
            alt="Funny Meme 2"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <img
            src="https://placehold.co/400x300"
            alt="Funny Meme 3"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </main>
  );
}
