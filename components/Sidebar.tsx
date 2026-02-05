"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      className={`bg-[#152238] text-white w-full md:w-96 flex flex-col flex-shrink-0 min-w-[100px] h-auto md:h-screen`}
    >
      <nav className="flex flex-col p-6 mt-10">
        <Link href="/" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded text-center w-full mb-6 text-lg">
          Hello World
        </Link>
        <Link href="/images" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded text-center w-full text-lg">
          Images
        </Link>
      </nav>
    </div>
  );
}
