"use client";

import { BaseCarousel } from "@/components";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-2">
      <SomeCarousel />
      <div>======================</div>
      <div className="w-[50%]">
        <SomeCarousel />
      </div>
    </main>
  );
}

// Example of usage
function SomeCarousel() {
  const mockItems = Array(30)
    .fill(" ")
    .map((_, index) => (
      <div
        key={index}
        className="flex flex-col justify-center items-center w-[100px] h-[100px] text-black"
      >
        <div className="w-[44px] h-[44px] bg-red-500 rounded-full" />
        <p>Title {index}</p>
      </div>
    ));

  return (
    <BaseCarousel
      PrevButtonComponent={(props) => (
        <button
          {...props}
          className="absolute z-[2] w-[32px] h-[32px] bg-white text-black rounded-full left-0 translate-x-[-8px] border"
        >
          {"<"}
        </button>
      )}
      NextButtonComponent={(props) => (
        <button
          {...props}
          className="absolute z-[2] w-[32px] h-[32px] bg-white text-black rounded-full right-0 translate-x-[8px] border"
        >
          {">"}
        </button>
      )}
      items={mockItems}
      limit={10}
    />
  );
}
