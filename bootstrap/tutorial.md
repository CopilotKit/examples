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

# First, we'll initialize a new stateful agent workflow
workflow = StateGraph(MessagesState)

# Next, we'll define some tools for the agent to use
# This function "searches the web" to get a current weather
# forecast. It's a placeholder, but you can probably imagine how
# it could be updated to call a real API or database.
#
# The `@tool` decorator augments this method so that it can be
# used by the agent
@tool
def search(query: str):
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."

# This tool node represents the "box" of available tools the
# agent can call upon to assist the user. This one only consists
# of our `search` mock function above, but you can easily add more.
tools = [search]
tool_node = ToolNode(tools)

# We're using OpenAI's gpt-4o model, but you could easily swap in Claude 3.5 Sonnet here
# model = ChatAnthropic(model="claude-3-5-sonnet-20240620").bind_tools(tools)
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)

# This function calls the model we initialized above, which was
# set up with our workflow's set of tools
def call_model(state: MessagesState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}


# Our workflow will cycle between these two nodes — tools, which
# fetch data or perform actions, and the agent that interacts with
# our users
workflow.add_node("tools", tool_node)
workflow.add_node("agent", call_model)

# Having added these nodes to the graph, now let's add some edges.

# First, we set the entrypoint as `agent` — i.e., this workflow
# should always begin with the AI agent as opposed to a tool.
workflow.add_edge(START, "agent")

# Next, we'll add 'conditional edges' which will act as a state
# machine, defining the order in which agent actions should be
# followed by tool calls or responses to the user.

# This function checks whether the LLM needs to call a tool, or
# else is ready to stop working and return a response.
def continue_or_respond(state: MessagesState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "tools" node
    if last_message.tool_calls:
        return "tools"
    # Otherwise, we stop (reply to the user)
    return END

# Here, we add this edge to the workflow, connecting the agent to
# our function that decides whether a tool call is needed.
workflow.add_conditional_edges(
    "agent",
    continue_or_respond,
)

# And here we add a normal edge from `tools` to `agent`, so that
# agents are invoked after a tools call so they can receive and
# process the data returned by the tool
workflow.add_edge("tools", 'agent')

# That's our workflow.

# Finally, we compile it! Here we're initializing and including
# a memory checkpointer that will persist state across runs
checkpointer = MemorySaver()
agent_app = workflow.compile(checkpointer=checkpointer)
```

This defines a simple agent that can ask for weather forecasts. In the `search` method, near the top, you'll see some placeholder code that checks whether a query contains "sf" or not and returns a hard-coded response. In your app, you can update this method to make a real search or API call, and can define additional "tools" that your agent can invoke.

Next, in `server.py`, add these lines to connect this agent graph to our web service:

```python
# ... existing code above this line ...

# Import CopilotKit SDK and integrations
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from agent import agent_app

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="weather_agent",
            description="Agent that asks about the weather",
            agent=agent_app
        )
    ],
)

add_fastapi_endpoint(app, sdk, "/copilotkit")
```

Here we're able to import the `agent_app` object that represents our graph, then pass it into `CopilotKitSDK` to use as an agent.

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
