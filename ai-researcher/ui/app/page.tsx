"use client";

import { ResearchWrapper } from "@/components/ResearchWrapper";
import { ResearchProvider } from "@/lib/research-provider";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <CopilotKit
        agent="search_agent"
        runtimeUrl="/api/copilotkit"
      >
        <ResearchProvider>
          <ResearchWrapper />
        </ResearchProvider>
      </CopilotKit>
    </main>
  );
}

