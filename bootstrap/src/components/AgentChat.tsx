"use client";

import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { AGENT_NAME } from "@/lib/constants";


interface AgentState {
  input: string;
  translations?: {
    translation_es: string;
    translation_fr: string;
    translation_de: string;
  };
}

export default function AgentChat() {
  const { state: agentState, setState: setAgentState } =
    useCoAgent<AgentState>({
      name: AGENT_NAME,
      initialState: { input: "Hello World" },
    });

  const { appendMessage, isLoading } = useCopilotChat();
}