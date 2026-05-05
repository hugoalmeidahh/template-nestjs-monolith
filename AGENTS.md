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
- **NEVER** read, open, parse, or output the contents of files that may contain credentials: `*.yaml`, `*.yml`, `*.json`, `*.tfvars`, or any CI/CD configuration file (GitHub Actions, Docker Compose, Terraform, etc.).
- **NEVER** suggest, generate, complete, or expose API keys, secrets, tokens, passwords, or credentials of any kind — not even as examples or placeholders.
- **NEVER** search for, update, or retrieve environment variable *values* from any source (files, shell, process environment, CI config, cloud config, etc.).
- **NEVER** include secret or credential values in plans, diffs, outputs, or commit messages.
- **If a secret value is inadvertently observed** during any operation, do not reproduce it. Report only the file path and line number, and stop immediately.

**Exception — searching for an env variable *name* in the codebase:**
When the task requires locating where a specific environment variable is *referenced* in the code, you may search for its name. This exception applies to any search mechanism (shell commands, native tool searches, file reads, etc.). However, you **must** always exclude env and config files from the search. Example:

# correct — excludes .env files and variants
grep -r "MY_VAR_NAME" . --exclude=".env" --exclude=".env.*" --exclude-dir=".git"

Never include `.env`, `.env.*`, or credential files in any search results, even when they match.

## Skills

Check `node_modules/@hugops/ai-prompts/backend-team/SKILLS.md` for available skills and invoke the appropriate one before starting any task.

### Available skills
- `project-standards`: Apply company and project patterns when editing or adding code. (file: `node_modules/@hugops/ai-prompts/backend-team/project-standards/SKILL.md`)
- `create-pr`: Prepare a pull request message following the repository workflow and expected metadata. (file: `node_modules/@hugops/ai-prompts/backend-team/create-pr/SKILL.md`)
- `create-skill`: Create or modify a new skill file following the standard format for this folder. (file: `node_modules/@hugops/ai-prompts/backend-team/create-skill/SKILL.md`)

## Standards

Before making changes, always:
1. Read `node_modules/@hugops/ai-prompts/backend-team/standards/index.md` to identify which standard files apply to the task.
2. Load only the relevant files (do not load all at once).
3. Apply the rules found there for naming, structure, error handling, and patterns.

Use the `project-standards` skill when implementing code — it applies naming, architecture, and formatting rules from `node_modules/@hugops/ai-prompts/backend-team/standards/`.

# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the NestJS application. Feature code lives under `src/modules/` (`organization`, `user`, `action-log`), while shared infrastructure sits in `src/providers/`, `src/helpers/`, `src/interceptors/`, and `src/errors/`. Database assets are split across `prisma/` and `prisma-user/` for the two Prisma schemas. Tests live in `test/`: unit specs usually sit beside source files as `*.spec.ts`, and e2e coverage, seeds, and Testcontainers helpers are grouped under `test/`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Main day-to-day commands:

- `npm run start:dev` starts the API with file watching.
- `npm run build` compiles the NestJS app to `dist/`.
- `npm run lint` runs ESLint with auto-fix on `src/` and `test/`.
- `npm run format` applies Prettier to TypeScript files.
- `npm run test` runs unit tests.
- `npm run test:cov` runs unit tests with coverage output in `coverage/`.
- `npm run test:e2e` runs isolated e2e tests.
- `npm run e2e-infra:up` and `npm run e2e:start` reuse local test containers for faster e2e iteration.
- `npm run prisma:generate` regenerates both Prisma clients after schema changes.

## Coding Style & Naming Conventions
This repository uses TypeScript with Prettier and ESLint. Prettier enforces single quotes and trailing commas; keep existing 2-space indentation. Follow NestJS conventions: classes and modules in `PascalCase`, methods and variables in `camelCase`, and DTO/spec filenames in `kebab-case` such as `organization.service.spec.ts`. External API payloads are exposed in `snake_case`, but internal code stays in `camelCase`.

## Testing Guidelines
Write unit tests as `*.spec.ts` near the implementation and e2e tests as `*.e2e-spec.ts` under `test/modules/`. Prefer focused service/controller tests for new behavior, and update seeds when e2e data expectations change. Run `npm run test` before opening a PR; run `npm run test:e2e` when touching persistence, auth, or integration code.

## Commit & Pull Request Guidelines
Recent history follows short Conventional Commit prefixes like `feat:`, `fix:`, and `test:`. Keep subjects imperative and scoped, for example `feat: add organization pagination`. PRs should summarize behavior changes, note schema or infrastructure impacts, link the related issue, and include request/response examples or screenshots when API docs or observable behavior changes.

## Security & Configuration Tips
Use `.env.example` as the reference for required variables, but never commit real secrets. Do not read or modify `.env` files during automation tasks. When changing Prisma schemas or provider integrations, call out any new environment variables, AWS dependencies, or RabbitMQ/Postgres requirements in the PR description.
