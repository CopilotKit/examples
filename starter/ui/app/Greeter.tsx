"use client";

import {
  useCoAgent,
  useCopilotChat,
  useCopilotContext,
} from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { useState } from "react";

export function Greeter() {
  const [name, setName] = useState("");
  const { state, start } = useCoAgent({ name: "greeter_agent" });
  const context = useCopilotContext();
  const { appendMessage } = useCopilotChat();

  console.log("state", state);

  const handleGreet = () => {
    start(context);
    appendMessage(
      new TextMessage({
        role: MessageRole.User,
        content: `My name is ${name}`,
      })
    );
  };

  return (
    <>
      {!state.greetings && (
        <>
          <input
            name="firstName"
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button disabled={!name} onClick={handleGreet}>Greet</button>
        </>
      )}
      {state.greetings && (
        <>
          <div>English: {state.greetings.greeting_en}</div>
          <div>French: {state.greetings.greeting_fr}</div>
          <div>Spanish: {state.greetings.greeting_es}</div>
          <div>Italian: {state.greetings.greeting_it}</div>
        </>
      )}
    </>
  );
}