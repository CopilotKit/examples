"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { Translator } from "./Translator";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
      <CopilotKit runtimeUrl="/api/copilotkit" agent="translate_agent">
        <Translator />
      </CopilotKit>
    </main>
  );
}
