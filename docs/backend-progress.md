# Backend foundation progress

## Implemented

- `GET /api/health` reports that the Next.js process is responding. It is a liveness check only; it does not claim that a database, queue, storage provider, or AI provider is ready.
- JSON API responses have a small shared envelope: successful responses use `{ "data": ... }`, and errors use `{ "error": { "code", "message" } }`. Responses are marked `no-store` by default.

## Deliberately not wired yet

The repository does not yet define a database, authentication provider, SSO tenant, object storage, background worker, or AI provider. The existing `/api/chat` route remains a UI simulation and is not an authenticated production endpoint. No domain endpoints should return invented persisted data until their storage and ownership rules exist.

## Frontend local workspace

The interface now starts empty for a new browser. A user can opt into an authored sample pack, import PDF/DOCX/PPTX/TXT files up to 50 MB into IndexedDB, write notes, take sample quizzes, plan sessions, and track tasks locally. Metadata and progress use versioned browser storage. No imported file or study record is synchronized to the server. The account, AI, and support screens must continue to describe their unavailable service status honestly until real endpoints exist.

## Next implementation slice

1. Agree the campus identity/SSO mapping and user ownership rules.
2. Choose and pin database/ORM versions; add schema, migrations, and deterministic seed data.
3. Add authenticated profile and materials endpoints with ownership checks.
4. Add private upload storage and processing status.
5. Add durable workflow runs and worker transitions, then connect the Workspace UI.

Before a real AI provider or user materials are connected, protect `/api/chat` with the chosen authentication and request limits, and replace its simulation response with the agreed workflow contract.
