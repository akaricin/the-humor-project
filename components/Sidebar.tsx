"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      className={`fixed left-0 top-0 z-50 bg-[#152238] text-[#FEFEFA] md:w-[250px] flex flex-col flex-shrink-0 min-w-[100px] h-screen`}
    >
      <nav className="flex flex-col p-6">

        <Link href="/" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-center w-4/5 mx-auto mb-6 text-[30px] no-underline">
          Hello World
        </Link>
        <Link href="/images" className="py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-center w-4/5 mx-auto mb-6 text-[30px] no-underline">
          Images
        </Link>
      </nav>
    </div>
  );
}
