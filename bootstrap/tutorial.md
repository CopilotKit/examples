Set up a new Next.js app with Coagents.

1. Create a new Next.js app

```bash
npx create-next-app@latest coagents-starter
cd coagents-starter
```

1. Add your OpenAI API key to your `.env` file

```bash
OPENAI_API_KEY="<your key>"
```

2. Set up a Python virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

You'll want to add the .venv directory to your `.gitignore` file.

```bash
echo ".venv" >> .gitignore
```

3. Install necessary Python packages

```bash
# TODO: Also OpenAI?
python -m pip install langgraph langchain copilotkit
```

4. Make a `requirements.txt` file

```bash
python -m pip freeze > requirements.txt
```

5. Create a new subdirectory for your agent's Python code

```bash
mkdir agent
```

6. Inside the `agent` directory, create these files:

```bash
touch agent/__init__.py agent/agent.py agent/server.py
```

We'll leave `__init__.py` empty for now.

7. Add the following code to `agent.py`:

```python
"""
This is the main entry point for the AI.
It defines the workflow graph and the entry point for the agent.
"""
# pylint: disable=line-too-long, unused-import

import json
from typing import cast, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage, AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import MessagesState

class Translations(TypedDict):
    """Contains the translations in four different languages."""
    translation_es: str
    translation_fr: str
    translation_de: str

class AgentState(MessagesState):
    """Contains the state of the agent."""
    translations: Translations
    input: str

async def translate_node(state: AgentState, config: RunnableConfig):
    """Chatbot that translates text"""
    model = ChatOpenAI(model="gpt-4o").bind_tools(
        [Translations],
        parallel_tool_calls=False,
        tool_choice=(
            None if state["messages"] and
            isinstance(state["messages"][-1], HumanMessage)
            else "Translations"
        )
    )

    response = await model.ainvoke([
        SystemMessage(
            content=f"""
            You are a helpful assistant that translates text to different languages
            (Spanish, French and German).
            Don't ask for confirmation before translating.
            {
                'The user is currently working on translating this text: "' +
                state["input"] + '"' if state.get("input") else ""
            }
            """
        ),
        *state["messages"],
    ], config)

    if hasattr(response, "tool_calls") and len(getattr(response, "tool_calls")) > 0:
        ai_message = cast(AIMessage, response)
        return {
            "messages": [
                response,
                ToolMessage(
                    content="Translated!",
                    tool_call_id=ai_message.tool_calls[0]["id"]
                )
            ],
            "translations": cast(AIMessage, response).tool_calls[0]["args"],
        }

    return {
        "messages": [
            response,
        ],
    }

workflow = StateGraph(AgentState)
workflow.add_node("translate_node", translate_node)
workflow.set_entry_point("translate_node")
workflow.add_edge("translate_node", END)
memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
```

8. Add the following code to `server.py`:

```python
"""

```
