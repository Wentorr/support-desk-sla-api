# Build Notes

This is the working plan for growing the API in small commits.

## Week 1

- Scaffold Express, TypeScript, test runner, and Docker setup.
- Add Prisma schema for organizations, users, sessions, and audit timestamps.
- Add registration, login, refresh, logout, and profile endpoints.
- Add password validation and token rotation tests.

Possible bug candidates after this phase:

- Expired access tokens are accepted when the middleware receives multiple auth headers.
- Refresh token rotation creates a new token but leaves the old session usable.
- Password validation treats a symbol at the regex boundary incorrectly.

## Week 2

- Add tickets, comments, SLA policies, assignments, and list endpoints.
- Add filtering, sorting, pagination, and scoped queries.
- Add typed API errors and validation responses for common failures.

Possible bug candidates after this phase:

- Ticket lists apply pagination before filters, producing missing records on later pages.
- Combining status and assignee filters builds the wrong query predicate.
- A ticket ownership check validates the user id but not the organization id.

## Week 3

- Add rate limiting, soft delete/restore, role permissions, and report endpoints.
- Add deterministic fixtures and broader API tests.
- Harden Dockerfile and prepare candidate task notes from actual fix commits.

Possible bug candidates after this phase:

- Requests on the rate-limit window boundary are counted in the wrong bucket.
- Soft-deleted tickets still appear in paginated list responses.
- A regular user can reach an admin-only path through a nested route.

