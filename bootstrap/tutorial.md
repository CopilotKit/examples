# [WIP] CoAgents onboarding

<aside>
👉

Working through some Git permissions issues to push code, copying tutorial outline here for commenting and visibility

</aside>

# Overview

We’ll walk through the steps to add a bare-bones AI agent—based on CopilotKit and LangGraph—to a Next.js application. While this example starts with a brand-new app, you should be able to easily adapt this walkthrough to add agent support to any existing React app.

For these examples, we’ll set up a self-hosted CopilotKit API endpoint as a Next.js API route and use a tiny Python-based FastAPI service to interface between our app, LangGraph, and our AI provider of choice (OpenAI, in this case).

# Tutorial steps

## Create a new Next.js app

```bash
npx create-next-app@latest coagents-starter
cd coagents-starter
```

## Set up `.env` file

Add your OpenAI API key to your `.env` file:

```bash
OPENAI_API_KEY="<your key>"
```

## Set up a Python virtual environment (optional, but recommended)

In the Python ecosystem, packages are installed globally by default, but you can optionally set up [_virtual environments_](https://docs.python.org/3/tutorial/venv.html) that behave similarly to `node_modules`, in that all your project dependencies will be downloaded and sandboxed for just this project.

```bash
# Creates a new directory called `.venv` for your Python runtime, packages, etc
python -m venv .venv

# Enables this virtual env in your shell
source .venv/bin/activate
```

You’ll want to add the `.venv` directory (or whatever name you chose) to your `.gitignore` file.

```bash
echo ".venv" >> .gitignore
```

Once your virtual env is set up, you can use its `bin` directory to access `python`, `pip`, or any command line tools installed via Python. You can even add this directory to your `PATH` to save some typing:

```bash
export PATH=./.venv/bin:$PATH

# After which, this will work
which python #=> .venv/bin/python
```

For clarity’s sake, from here on out we’ll use the `.venv/bin/*` prefixed commands, but if you followed this step you can omit the prefix.

## Install necessary Python packages

```bash
# TODO: Also OpenAI?
.venv/bin/pip install langgraph langchain copilotkit \
  "fastapi[standard]" python-dotenv
```

If you’re new to Python and `pip`, be aware that `pip` does _not_ automatically save new dependencies. You’ll need to dump a list of your agent’s dependencies to a `requirements.txt` file, which you can check into source control:

```bash
.venv/bin/pip freeze > requirements.txt
```

## Set up your agent directory and source files

We’ll be setting up our LangGraph agent in a subdirectory called `agent`.

```bash
mkdir agent
touch agent/__init__.py agent/agent.py agent/server.py
```

We'll leave `__init__.py` empty for now. In the file called [`server.py`](http://server.py) we’ll start by adding a simple “Hello, World” example to confirm that our Python environment is working.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Next, run the `fastapi` command which will start an API server:

```bash
.venv/bin/fastapi dev agent/server.py
```

You should then be able to access [`localhost:8000`](http://localhost:8000) which will return the Hello World message as JSON.

## Create an agent

There's a lot that can go into "creating an agent" with [LangGraph](https://langchain-ai.github.io/langgraph/) that's hard to walk through and summarize here. To keep things simple, we'll follow an example adapted from [LangChain's API docs](https://langchain-ai.github.io/langgraph/#example), with a couple changes so it will work with our CopilotKit frontend.

Paste this code into `agent/agent.py`:

```python
from typing import Literal
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode


# Define the tools for the agent to use
@tool
def search(query: str):
    """Call to surf the web."""
    # This is a placeholder, but don't tell the LLM that...
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."


tools = [search]

tool_node = ToolNode(tools)

# We're using OpenAI's gpt-4o model, but you could easily swap in Claude 3.5 Sonnet here
# model = ChatAnthropic(model="claude-3-5-sonnet-20240620").bind_tools(tools)
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)

# Define the function that determines whether to continue or not
def should_continue(state: MessagesState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "tools" node
    if last_message.tool_calls:
        return "tools"
    # Otherwise, we stop (reply to the user)
    return END


# Define the function that calls the model
def call_model(state: MessagesState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}


# Define a new graph
workflow = StateGraph(MessagesState)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.add_edge(START, "agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge("tools", 'agent')

# Initialize memory to persist state between graph runs
checkpointer = MemorySaver()

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable.
# Note that we're (optionally) passing the memory when compiling the graph
app = workflow.compile(checkpointer=checkpointer)

# Use the Runnable
final_state = app.invoke(
    {"messages": [HumanMessage(content="what is the weather in sf")]},
    config={"configurable": {"thread_id": 42}}
)
final_state["messages"][-1].content
```

This defines a simple agent that can ask for weather forecasts. In the `search` method, near the top, you'll see some placeholder code that checks whether a query contains "sf" or not and returns a hard-coded response. In your app, you can update this method to make a real search or API call, and can define additional "tools" that your agent can invoke.

Next, in `server.py`, add these lines to connect this agent graph to our web service:

```python
# ... existing code above this line ...

# Import CopilotKit SDK and integrations
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from agent import graph

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="weather_agent",
            description="Agent that asks about the weather",
            agent=graph
        )
    ],
)

add_fastapi_endpoint(app, sdk, "/copilotkit")
```

## Integrate the agent into your Next.js app

As of September 2024, to take advantage of CoAgents you will need to self-host CopilotKit's API service, but this can easily be set up as a Next.js API route. Add a new API route file at `app/copilotkit/route.ts`, which will mount a CopilotKit service handler at `/copilotkit`:

```ts
import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

// Use the REMOTE_ACTION_URL env variable in production to tell this
// app where your agent web service is, otherwise fall back to the
// port used for development
const BASE_URL = process.env.REMOTE_ACTION_URL || "http://127.0.0.1:8000";

const openai = new OpenAI();
const serviceAdapter = new OpenAIAdapter({ openai });

const runtime = new CopilotRuntime({
  remoteActions: [
    {
      url: `${BASE_URL}/copilotkit`,
    },
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
```

## Building your CoAgent UI

Now, at last, the fun part.
