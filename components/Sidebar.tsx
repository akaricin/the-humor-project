"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      className={`fixed left-0 top-0 z-50 bg-[#152238] text-white w-full md:w-96 flex flex-col flex-shrink-0 min-w-[100px] h-screen`}
    >
      <nav className="flex flex-col p-6 mt-10">
        <Link href="/" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded text-center w-full mb-6 text-[30px]">
          Hello World
        </Link>
        <Link href="/images" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded text-center w-full text-[30px]">
          Images
        </Link>
      </nav>
    </div>
  );
}
