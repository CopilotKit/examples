from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
# from copilotkit.integrations.fastapi import add_fastapi_endpoint
# from copilotkit import CopilotKitSDK, LangGraphAgent

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}