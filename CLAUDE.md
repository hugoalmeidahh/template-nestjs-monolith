# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

Before starting any task:

1. **Clarify before planning** — If any part of the request is ambiguous or unclear, ask before proceeding. Do not make assumptions.
2. **Define scope** — Identify exactly which files and functions are within the task's context. List them explicitly in the plan.
3. **Present a plan first** — Always present the implementation plan and wait for approval before making any changes.
4. **Stay in scope** — Do not modify files or functions outside the defined task context. If a change outside scope seems necessary, include it as a separate item in the plan with justification, and wait for explicit approval.
5. **Verify build after changes** — After every set of changes, run the build command declared in `package.json` and fix any TypeScript compilation errors before considering the task done.

## Guardrails

> **⚠️ CRITICAL — these rules are absolute and must never be violated.**

- **NEVER** read, open, parse, or output the contents of any `.env`, `.env.*`, or environment file.
- **NEVER** read, open, parse, or output the contents of files that may contain credentials: `*.tfvars`, `docker-compose*.yml`, or CI/CD secret configuration files.
- **NEVER** suggest, generate, complete, or expose API keys, secrets, tokens, passwords, or credentials of any kind — not even as examples or placeholders.
- **NEVER** search for, update, or retrieve environment variable *values* from any source (files, shell, process environment, CI config, cloud config, etc.).
- **NEVER** include secret or credential values in plans, diffs, outputs, or commit messages.
- **If a secret value is inadvertently observed** during any operation, do not reproduce it. Report only the file path and line number, and stop immediately.

**Exception — searching for an env variable *name* in the codebase:**
When the task requires locating where a specific environment variable is *referenced* in the code, you may search for its name. This exception applies to any search mechanism (shell commands, native tool searches, file reads, etc.). However, you **must** always exclude env and config files from the search. Example:

```bash
# correct — excludes .env files and variants
grep -r "MY_VAR_NAME" . --exclude=".env" --exclude=".env.*" --exclude-dir=".git"
```

Never include `.env`, `.env.*`, or credential files in any search results, even when they match.

## Skills

Check `node_modules/@hugops/ai-prompts/backend-team/SKILLS.md` for available skills and invoke the appropriate one before starting any task.

## Standards

Before making changes, always:
1. Read `node_modules/@hugops/ai-prompts/backend-team/standards/index.md` to identify which standard files apply to the task.
2. Load only the relevant files (do not load all at once).
3. Apply the rules found there for naming, structure, error handling, and patterns.

Use the `project-standards` skill when implementing code — it applies naming, architecture, and formatting rules from `node_modules/@hugops/ai-prompts/backend-team/standards/`.

## Build & Development Commands

```bash
npm run build              # Build with NestJS CLI (SWC)
npm run start:dev          # Dev server with watch mode
npm run start:prod         # Production: node dist/src/main
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm run test               # Unit tests (Jest)
npm run test -- --testPathPattern=<pattern>  # Run a single test file
npm run test:e2e           # E2E tests (requires Docker for testcontainers)
npm run prisma:generate    # Generate both Prisma clients (main + user)
npm run prisma:migrate-dev # Run main DB migrations in dev
npm run prisma:create-migration <name>  # Create a new migration
```

## Architecture

### Dual Database Pattern
Two separate PostgreSQL databases with independent Prisma schemas and clients:
- **Main DB** (`prisma/schema.prisma`): Organizations, ActionLogs — uses `DATABASE_URI`
- **User DB** (`prisma-user/schema.prisma`): Users — uses `DATABASE_USER_URI`

Both use Prisma 7 with `@prisma/adapter-pg` for native PostgreSQL connectivity. Each generates a separate client into its own `generated/prisma` directory. After schema changes, run `npm run prisma:generate` to regenerate both clients.

### Automatic Case Conversion
The API communicates in **snake_case** while internal code uses **camelCase**. This is handled transparently:
- `BodyQueryTransformPipe` converts incoming snake_case → camelCase
- `ResponseTransformInterceptor` converts outgoing camelCase → snake_case
- Swagger schemas are also transformed to snake_case

### Global Bootstrap Pipeline (`src/main.ts` → `src/helpers/bootstrap.helper.ts`)
The app applies these globally: CORS (all origins), ValidationPipe with transform, GlobalErrorFilter, ResponseTransformInterceptor, and BodyQueryTransformPipe.

### Error Handling & Authentication
See `error-handling.md` and `auth-security.md` in the standards package for detailed rules. In short: custom errors extend `BaseError`, 5xx are masked in responses, and auth uses HTTP Basic via Passport.

### Secrets Management
In staging/production, `src/secrets.config.ts` loads secrets from AWS Secrets Manager before app startup, overriding environment variables.

### Provider Pattern (`src/providers/`)
Infrastructure services registered as NestJS providers:
- **Prisma**: `PrismaService` (main DB) and `PrismaUserService` (user DB) — both connect on `OnModuleInit`
- **AWS**: S3 operations (signed URLs, file retrieval)
- **AMQPLIB**: RabbitMQ message publishing with auto-reconnect
- **Sentry**: Conditional error tracking based on `SENTRY_DSN`

### Pagination
Uses `prisma-pagination` library. Controllers accept `PaginatedArgs` (page, perPage, orderBy, order) and return paginated responses with meta: `{ total, lastPage, currentPage, perPage, prev, next }`.

### Action Logging
`ActionLogService` provides transactional audit logging (context, action, userId, organizationId). Called explicitly from service layer methods, not as middleware.

## Testing

E2E tests use **testcontainers** to spin up PostgreSQL and RabbitMQ Docker containers. Test setup is in `test/global-before-all.ts` (creates containers, runs migrations, seeds data) and `test/global-after-all.ts` (cleanup). Seeds are in `test/seeds/`. Default test auth credentials: `internal/internal`.

## Deployment

- **Docker**: Node 22 Alpine, runs prisma:generate + build, starts with `node dist/src/main`
- **Kubernetes**: `k8s/deployment.yml` with 2 replicas, port 3777
- **CI/CD**: GitHub Actions triggered by semver tags (`v*.*.*-staging` / `v*.*.*-production`) or manual dispatch. Supports EKS, ECS, and Lambda targets via `hugopsinc/pipeline-templates`
