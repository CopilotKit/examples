"use client";

import { HomeView } from "@/components/HomeView";
import { ResultsView } from "@/components/ResultsView";
import { ResearchProvider, useResearchContext } from "@/lib/research-provider";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <ResearchProvider>
        <ResearchWrapper />
      </ResearchProvider>
    </main>
  );
}

export function ResearchWrapper() {
  const { researchQuery, setResearchInput } = useResearchContext();

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen relative z-10">
        <div className="flex-1">
          {researchQuery ? (
            <AnimatePresence
              key="results"
              onExitComplete={() => {
                setResearchInput("");
              }}
              mode="wait"
            >
              <ResultsView key="results" />
            </AnimatePresence>
          ) : (
            <AnimatePresence key="home" mode="wait">
              <HomeView key="home" />
            </AnimatePresence>
          )}
        </div>
        <footer className="text-xs p-2">
          <a
            href="https://copilotkit.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 font-medium hover:underline"
          >
            Powered by CopilotKit 🪁
          </a>
        </footer>
      </div>
    </>
  );
}
