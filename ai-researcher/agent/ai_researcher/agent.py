"""
This is the main entry point for the AI.
It defines the workflow graph and the entry point for the agent.
"""
# pylint: disable=line-too-long, unused-import
import json

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from ai_researcher.state import AgentState
from ai_researcher.chatbot import chatbot_node
from ai_researcher.search import search_node
from ai_researcher.summarize import summarize_node

def route(state):
    """Route to story writing nodes."""
    if not state.get("tasks", None):
        return END

    current_task = next((task for task in state["tasks"] if task["status"] == "pending"), None)

    if not current_task:
        return "summarize_node"

    if current_task["type"] == "search":
        return "search_node"

    raise ValueError(f"Unknown task type: {current_task['type']}")

# Define a new graph
workflow = StateGraph(AgentState)
workflow.add_node("chatbot_node", chatbot_node)
workflow.add_node("search_node", search_node)
workflow.add_node("summarize_node", summarize_node)
# Chatbot
workflow.set_entry_point("chatbot_node")

workflow.add_conditional_edges(
    "chatbot_node", 
    route,
    ["summarize_node", "search_node", END]
)

workflow.add_conditional_edges(
    "search_node",
    route,
    ["summarize_node", "search_node"]
)

workflow.add_edge("summarize_node", END)

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
