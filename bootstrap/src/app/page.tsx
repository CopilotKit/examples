"use client";

import WeatherChat from "@/components/WeatherChat";
import { AGENT_NAME, RUNTIME_URL } from "@/lib/constants";
import { CopilotKit } from "@copilotkit/react-core";

export default function Home() {
  return (
    <main>
      <CopilotKit runtimeUrl={RUNTIME_URL} agent={AGENT_NAME}>
        <WeatherChat /> 
      </CopilotKit>
    </main>
  );
}
