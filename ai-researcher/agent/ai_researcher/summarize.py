"""
The summarize node is responsible for summarizing the information.
"""

import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from copilotkit.langchain import configure_copilotkit

from ai_researcher.state import AgentState

async def summarize_node(state: AgentState, config: RunnableConfig):
    """
    The summarize node is responsible for summarizing the information.
    """

    system_message = f"""
The system has performed a series of tasks to answer the user's query.
These are all of the tasks: {json.dumps(state["tasks"])}

Please summarize the result the final result and include all relevant information and reference links.
"""

    config = configure_copilotkit(
        config,
        emit_messages=True,       
    )

    response = await ChatOpenAI(model="gpt-4o").ainvoke([
        *state["messages"],
        SystemMessage(
            content=system_message
        )
    ], config)

    return {
        "messages": [
            SystemMessage(
                content=system_message
            ),
            response
        ],
        "tasks": None
    }
