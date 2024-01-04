# OpenAI Thread Service

This service provides an API to interact with OpenAI's beta Assistant API.

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository>
cd <repository>
npm install
```

Start the server:
```bash
npm start
```

The server runs on the port specified in your environment variables (default is 3000).

## Endpoints
### Create Assistant

`POST /assistant`

Create a new assistant. Requires `name`, `instructions`, and `model` in the request body.

Example:
```bash
curl -X POST https://{host}/assistant \
-H 'Content-Type: application/json' \
-d '{
    "name": "assistant_name",
    "instructions": "assistant_instructions",
    "model": "assistant_model"
}'
```

### Create new thread
`POST /thread`

### Create new message in the thread

`POST /message`

Create new message. Requires `thread_id` and `content`

Example:

```bash
curl -X POST http://localhost:3000/message \
-H 'Content-Type: application/json' \
-d '{
    "thread_id": "your_thread_id_here",
    "content": "your_message_content_here"
}'
```

### Create new run

`POST /run`

Create new run. Requires `assistant_id` and `thread_id`

### Get run status

`GET /run`

Retrieve a run from a thread. Requires `thread_id` and `run_id` in the request body.

### List all Messages in a Thread

`GET /messages`

List all messages in a thread. Requires `thread_id` in the request body.

### Health Check

`GET /health`

Returns 'OK' if the server is running.

