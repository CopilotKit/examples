"use client";

import * as React from 'react'
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
  const buttonIsDisabled = !agentState.input || isLoading;

  const handleMessage = () => {
    appendMessage(
      new TextMessage({
        role: MessageRole.System,
        content: "Translate to all languages",
      })
    );
  };

  // The form submit event should cover both hitting Enter and clicking Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleMessage();
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.target.value;
    setAgentState({
      ...agentState,
      input
    })
  }

  return (
    <div className='flex flex-col w-full max-w-lg border border-neutral-200 p-8 min-h-[50vh] '>
      <form onSubmit={handleSubmit} className='flex'>
        <input type="text" placeholder="Ask a question" value={agentState.input} onChange={handleChange} className='border border-r-0 border-neutral-300 p-2 flex-1' />
        <button type="submit" disabled={buttonIsDisabled} className='bg-neutral-600 text-white p-2 font-bold'>
          {isLoading ? "Working..." : "Submit"}
        </button>
      </form>
      <div className='flex-1'>
        HAHAHA
      </div>
      <CopilotPopup defaultOpen={true} />
    </div>
  )
}