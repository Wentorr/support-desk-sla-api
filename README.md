# Support Desk SLA API

A TypeScript REST API for tracking support tickets, SLA policies, and escalation risk across small customer support teams.

The project is intentionally boring in the good way: plain HTTP endpoints, a relational data model, deterministic tests, and business rules that are easy to describe but easy to get subtly wrong.

## Development

```bash
npm install
npm run dev
```

Run the tests:

```bash
npm test
```

Build the server:

```bash
npm run build
```

## First API Surface

- `GET /health` returns process and service status.
- Auth, users, tickets, SLA policies, reports, and rate limits will be added in small commits.

## Notes

The API is built around a few practical support-desk rules:

- Organizations own their users, tickets, and policies.
- Ticket visibility must not cross organization boundaries.
- SLA deadlines depend on priority, business hours, holidays, and ticket state.
- Report endpoints should explain the current state without mutating tickets.

