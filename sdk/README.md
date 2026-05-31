# @apiguardian/sdk

Express middleware that automatically monitors API requests and sends telemetry (endpoint, method, status code, latency, errors) to the API Guardian backend for logging and incident detection.

## Install

```bash
npm install @apiguardian/sdk
```

## Usage

Attach the middleware to your Express app with your API key and backend URL:

```js
const express = require("express");
const monitor = require("@apiguardian/sdk");

const app = express();

app.use(monitor({
  apiKey: "your-api-key",
  serverUrl: "http://your-backend-server.com",
}));

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

app.listen(3000);
```

## Options

| Option | Required | Description |
|--------|----------|-------------|
| `apiKey` | Yes | Your API Guardian API key. Sent as `x-api-key` header. |
| `serverUrl` | Yes | URL of the API Guardian backend server (e.g. `http://localhost:5000`). |

## How it works

1. The middleware intercepts every incoming request
2. Records the endpoint, HTTP method, status code, and response latency
3. Captures error messages from failed responses (4xx/5xx)
4. Sends the data to the backend's `POST /api/logs` endpoint asynchronously

## Publishing

To publish a new version to npm:

```bash
npm login
cd sdk
npm publish
```
