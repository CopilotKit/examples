from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Import CopilotKit SDK and integrations
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from agent import agent_app

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="translate_agent",
            description="Agent that asks about the weather",
            agent=agent_app,
        )
    ],
)

add_fastapi_endpoint(app, sdk, "/copilotkit")