# [WIP] CoAgents onboarding

<aside>
👉

Working through some Git permissions issues to push code, copying tutorial outline here for commenting and visibility

</aside>

# Overview

We’ll walk through the steps to add a bare-bones AI agent—based on CopilotKit and LangGraph—to a Next.js application. While this example starts with a brand-new app, you should be able to easily adapt this walkthrough to add agent support to any existing React app.

For these examples, we’ll set up a self-hosted CopilotKit API endpoint as a Next.js API route and use a tiny Python-based FastAPI service to interface between our app, LangGraph, and our AI provider of choice (OpenAI, in this case).

# Tutorial steps

## Create a new Next.js app

```bash
npx create-next-app@latest coagents-starter
cd coagents-starter
```

## Set up `.env` file

Add your OpenAI API key to your `.env` file:

```bash
OPENAI_API_KEY="<your key>"
```

## Set up a Python virtual environment (optional, but recommended)

In the Python ecosystem, packages are installed globally by default, but you can optionally set up [_virtual environments_](https://docs.python.org/3/tutorial/venv.html) that behave similarly to `node_modules`, in that all your project dependencies will be downloaded and sandboxed for just this project.

```bash
# Creates a new directory called `.venv` for your Python runtime, packages, etc
python -m venv .venv

# Enables this virtual env in your shell
source .venv/bin/activate
```

You’ll want to add the `.venv` directory (or whatever name you chose) to your `.gitignore` file.

```bash
echo ".venv" >> .gitignore
```

Once your virtual env is set up, you can use its `bin` directory to access `python`, `pip`, or any command line tools installed via Python. You can even add this directory to your `PATH` to save some typing:

```bash
export PATH=./.venv/bin:$PATH

# After which, this will work
which python #=> .venv/bin/python
```

For clarity’s sake, from here on out we’ll use the `.venv/bin/*` prefixed commands, but if you followed this step you can omit the prefix.

## Install necessary Python packages

```bash
# TODO: Also OpenAI?
.venv/bin/pip install langgraph langchain copilotkit \
  "fastapi[standard]" python-dotenv
```

If you’re new to Python and `pip`, be aware that `pip` does _not_ automatically save new dependencies. You’ll need to dump a list of your agent’s dependencies to a `requirements.txt` file, which you can check into source control:

```bash
.venv/bin/pip freeze > requirements.txt
```

## Set up your agent directory and source files

We’ll be setting up our LangGraph agent in a subdirectory called `agent`.

```bash
mkdir agent
touch agent/__init__.py agent/agent.py agent/server.py
```

We'll leave `__init__.py` empty for now. In the file called [`server.py`](http://server.py) we’ll start by adding a simple “Hello, World” example to confirm that our Python environment is working.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Next, run the `fastapi` command which will start an API server:

```bash
.venv/bin/fastapi dev agent/server.py
```

You should then be able to access [`localhost:8000`](http://localhost:8000) which will return the Hello World message as JSON.
