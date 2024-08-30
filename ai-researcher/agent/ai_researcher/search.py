"""
The search node is responsible for searching the internet for information.
"""
import json

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage

from langchain_core.runnables import RunnableConfig
from langchain_community.tools import TavilySearchResults

from ai_researcher.state import AgentState

async def search_node(state: AgentState, config: RunnableConfig):
    """
    The search node is responsible for searching the internet for information.
    """
    tavily_tool = TavilySearchResults(
        max_results=10,
        search_depth="advanced",
        include_answer=True,
        include_raw_content=True,
        include_images=True,
    )

    current_task = next((task for task in state["tasks"] if task["status"] == "pending"), None)

    if current_task is None:
        raise ValueError("No task to search for")

    if current_task["type"] != "search":
        raise ValueError("Current task is not a search task")

    system_message = f"""
This is a step in a series of tasks that are being executed to answer the user's query.
These are all of the tasks: {json.dumps(state["tasks"])}

You are responsible for carrying out the task: {json.dumps(current_task)}

This is what you need to search for, please come up with a good search query: {current_task["description"]}
"""
    
    model = ChatOpenAI(model="gpt-4o").bind_tools(
        [tavily_tool],
        parallel_tool_calls=False,
        tool_choice=tavily_tool.name
    )

    response = await model.ainvoke([
        *state["messages"],
        SystemMessage(
            content=system_message
        )
    ], config)

    tool_msg = tavily_tool.invoke(response.tool_calls[0])


    system_message = f"""
This task was just executed: {json.dumps(current_task)}

This is the result of the search: {tool_msg}

Please summarize the result of the search and include all relevant information and reference links.
"""

    response = await ChatOpenAI(model="gpt-4o").ainvoke([
        *state["messages"],
        SystemMessage(content=system_message)
    ], config)

    current_task["result"] = response.content
    current_task["status"] = "complete"

    return state
