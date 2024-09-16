"""
The summarize node is responsible for summarizing the information.
"""

import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from copilotkit.langchain import configure_copilotkit

from my_agent.state import AgentState

async def greet_node(state: AgentState, config: RunnableConfig):
    """
    The greet node is responsible for greeting the user.
    """

    config = configure_copilotkit(
        config,
        emit_intermediate_state=[
            {
                "state_key": "greetings",
                "tool": "greet"
            }
        ]
    )

    system_message = f"""
      You must greet the user in French.
    """

    greet_tool = {
        'name': 'greet',
        'description': """
    Greet the user in four different languages (English, French, Spanish and Italian).
    """,
        'parameters': {
            'type': 'object',
            'properties': {
                'greeting_en': {
                    'description': 'The greeting in English.',
                    'type': 'string'
                },
                'greeting_fr': {
                    'description': 'The greeting in French.',
                    'type': 'string'
                },
                'greeting_es': {
                    'description': 'The greeting in Spanish.',
                    'type': 'string'
                },
                'greeting_it': {
                    'description': 'The greeting in Italian.',
                    'type': 'string'
                }
            },
            'required': ['greeting_en', 'greeting_fr', 'greeting_es', 'greeting_it']
        }
    }

    response = await ChatOpenAI(model="gpt-4o").bind_tools([greet_tool], parallel_tool_calls=False, tool_choice="greet").ainvoke([
        *state["messages"],
        SystemMessage(
            content=system_message
        )
    ], config)

    return {
        "messages": [           
            response,
        ],
        "greetings": response.tool_calls[0]["args"],
    }
