"use client";

import { CopilotKit } from "@copilotkit/react-core";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
      <CopilotKit runtimeUrl="/copilotkit" agent="starter_agent">
        
      </CopilotKit>
    </main>
  );
}
