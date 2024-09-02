# AI Researcher Example

## Running the Agent

First, install the dependencies:

```sh
cd ai-researcher/agent
poetry install
```

Then, create a `.env.local` file inside `ai-researcher/agent` with the following:
```
OPENAI_API_KEY=...
TAVILY_API_KEY=...
```

Then, run the demo:

```sh
poetry run demo
```

## Running the UI

First, install the dependencies:

```sh
cd ai-researcher/ui
pnpm i
```

Then, create a `.env.local` file inside `ai-researcher/ui` with the following:
```
OPENAI_API_KEY=...
```

Then, run the Next.js project:

```sh
pnpm run dev
```

## Usage

Navigate to [http://localhost:3000](http://localhost:3000).