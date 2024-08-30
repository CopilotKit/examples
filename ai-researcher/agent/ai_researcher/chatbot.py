"""
Main chatbot node.
"""


from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from copilotkit.langchain import configure_copilotkit

from ai_researcher.state import AgentState

# pylint: disable=line-too-long

async def chatbot_node(state: AgentState, config: RunnableConfig):
    """
    The chatbot is responsible for answering the user's questions and building the query.
    """


    config = configure_copilotkit(
        config,
        emit_messages=True,
        emit_state={
            "tasks": {
                "tool": "search",
                "argument": "tasks"
            },
        }
    )

    system_message = """
You are a search assistant. Your task is to help the user with complex search queries by breaking the down into smaller tasks.

These subtasks are then executed serially. In the end, a final answer is produced in markdown format.


"""

    # use the openai tool format to get access to enums
    search_tool = {
        'name': 'search',
        'description': """
Break the user's query into smaller tasks.

Use task type "search" to search the web for information.

Make sure to add all the tasks needed to answer the user's query.
""",
        'parameters': {
            'type': 'object',
            'properties': {
                'tasks': {
                    'description': """The tasks to be executed.""",
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'id': {
                                'description': 'The id of the task. This is used to identify the task in the state. Just make sure it is unique.',
                                'type': 'string'
                            },
                            'description': {
                                'description': 'The description of the task, i.e. "search for information about the latest AI news"',
                                'type': 'string'
                            },
                            'status': {
                                'description': 'The status of the task. Always "pending".',
                                'type': 'string',
                                'enum': ['pending']
                            },
                            'type': {
                                'description': 'The type of task.',
                                'type': 'string',
                                'enum': ['search']
                            }
                        },
                        'required': ['description', 'status', 'type']
                    }
                }
            },
            'required': ['tasks']
        }
    }

    response = await ChatOpenAI(model="gpt-4o").bind_tools([search_tool], parallel_tool_calls=False).ainvoke([
        *state["messages"],
        SystemMessage(
            content=system_message
        )
    ], config)

    if not response.tool_calls:
        return {
            "messages": response,
        }
    
    return {
        "messages": [
            response,
            ToolMessage(
                name=response.tool_calls[0]["name"],
                content="executing tasks...",
                tool_call_id=response.tool_calls[0]["id"]
            )
        ],
        "tasks": response.tool_calls[0]["args"]["tasks"],
    }
