// app/page.tsx - Updated Home component
import Image from "next/image";
import { Suspense } from "react";
import GeneratedAIContent from "@/components/GenerateAIContent";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-7xl">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4 w-full max-w-6xl">
              <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded w-1/2 mx-auto"></div>
              <div className="h-12 bg-black/[.05] dark:bg-white/[.06] rounded w-32 mx-auto"></div>
            </div>
          }
        >
          <GeneratedAIContent />
        </Suspense>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          PortfolioAI &copy; 2025
        </a>
      </footer>
    </div>
  );
}
