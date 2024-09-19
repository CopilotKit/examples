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
    """Call to ask about the weather."""
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