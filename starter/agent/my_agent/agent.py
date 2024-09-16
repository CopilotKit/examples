"""
This is the main entry point for the AI.
It defines the workflow graph and the entry point for the agent.
"""
# pylint: disable=line-too-long, unused-import

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from my_agent.state import AgentState
from my_agent.greet import greet_node

# Define a new graph
workflow = StateGraph(AgentState)
workflow.add_node("greet_node", greet_node)
# Chatbot
workflow.set_entry_point("greet_node")

workflow.add_edge("greet_node", END)

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
