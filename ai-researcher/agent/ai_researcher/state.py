"""
This is the state definition for the AI.
It defines the state of the agent and the state of the conversation.
"""

from typing import List, TypedDict, Optional
from langgraph.graph import MessagesState

class Task(TypedDict):
    """
    Represents a task in the agent's state.
    """
    id: str
    description: str
    status: str
    type: str
    result: Optional[str]

class AgentState(MessagesState):
    """
    This is the state of the agent.
    It is a subclass of the MessagesState class from langgraph.
    """
    tasks: List[Task]
