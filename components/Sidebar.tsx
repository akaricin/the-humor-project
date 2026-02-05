"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-80 flex flex-col`}
    >
      <nav className="flex flex-col p-4 mt-10">
        <Link href="/" className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 rounded text-center w-full mb-4">
          Hello World
        </Link>
        <Link href="/images" className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 rounded text-center w-full">
          Images
        </Link>
      </nav>
    </div>
  );
}
