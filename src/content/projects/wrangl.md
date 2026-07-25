---
title: "Wrangl"
description: "An open-source CLI that turns any REST API into an agent-ready MCP server in one command, so tools like Claude and Cursor can call it directly."
techStack: ["TypeScript", "Node.js", "MCP", "Docker", "PostgreSQL"]
githubUrl: "https://github.com/asgerami/wrangl"
featured: true
---

Wrangl bridges the gap between AI agents that speak MCP (Model Context Protocol) and the REST APIs that don't. Point it at an API and it discovers the spec, generates typed tools, and runs an MCP proxy in front of it - no hand-written server required.

## Key Features

- **One-command setup** - `npx @asgerami/wrangl install <api-url>` discovers the OpenAPI spec, generates tools, and configures your agent automatically
- **API catalog** - pre-built servers for popular services like GitHub, Stripe, OpenAI, Slack, and Discord
- **Auto-discovery** - probes well-known paths and documentation to find OpenAPI specs without manual configuration
- **Secure by default** - Bearer, Basic, API key, OAuth2, and OpenID Connect auth are handled server-side, so credentials never reach the agent
- **Interactive dashboard** - create servers, test tools, and monitor logs and analytics from one place

## Technical Highlights

- Production-ready deployment via Docker, with an optional Postgres backend for multi-replica scaling
- Rate limiting and admin authentication built in
- Workflow: REST API → spec ingestion → tool generation → MCP runtime proxy → agent client
