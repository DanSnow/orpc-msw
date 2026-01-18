# Project Context

## Purpose
`orpc-msw` is an adapter library that bridges [oRPC](https://github.com/unnoq/orpc) **OpenAPI contracts** with [MSW (Mock Service Worker)](https://mswjs.io/). It enables developers to create type-safe MSW handlers directly from their oRPC contract definitions, providing seamless API mocking for testing and development.

**Important**: This library is specifically designed for **OpenAPI-based oRPC contracts** only. It does **not** support oRPC's `RPCHandler` due to its lack of direct HTTP method/path mapping required for MSW interception.

### Problems Solved
- **Lack of type safety in mocks**: Ensures mock responses adhere to `@orpc/contract` definitions
- **Complex mock setup**: Reduces boilerplate when creating MSW handlers for oRPC procedures
- **Inconsistent testing environments**: Provides consistent API mocking across unit, integration, and e2e tests

### Key Goals
- Provide type-safe MSW handler generation from oRPC contracts
- Mirror the oRPC contract router structure for intuitive API
- Support static, dynamic, and custom `HttpResponse`/`Response` mock responses
- Handle all HTTP methods supported by oRPC (GET, POST, PUT, PATCH, DELETE, HEAD)

## Tech Stack
- **Language**: TypeScript (strict mode, ES modules)
- **Runtime**: Node.js 22+
- **Build Tool**: tsdown (TypeScript bundler)
- **Test Framework**: Vitest
- **Package Manager**: pnpm 10.x
- **Task Runner**: Moon (moonrepo)
- **Linting**: oxlint
- **Formatting**: oxfmt (TypeScript/JavaScript) + Prettier (Markdown, YAML, Astro)
- **CI/CD**: GitHub Actions
- **Release**: release-please (automated changelog and versioning)

## Project Conventions

### Code Style
- Use oxfmt for TypeScript/JavaScript formatting
- Use oxlint for linting with `--fix` auto-corrections
- Prefer explicit type annotations for public APIs
- Use JSDoc comments for exported functions, types, and interfaces
- Naming conventions:
  - PascalCase for types and interfaces (e.g., `MSWProcedure`, `MSWUtilities`)
  - camelCase for functions and variables (e.g., `createMSWUtilities`, `mockResponse`)
  - Prefix internal types with descriptive names (e.g., `MSWProcedureInput`, `MSWMockInput`)

### Architecture Patterns
- **Proxy-based API**: Uses JavaScript Proxy to create a recursive structure that mirrors the oRPC contract router
- **Type inference**: Leverages TypeScript's type inference to provide full type safety from contract definitions
- **Single export pattern**: Main functionality exposed through `createMSWUtilities` function
- **Peer dependencies**: oRPC and MSW are peer dependencies to avoid version conflicts

### Testing Strategy
- Use Vitest for unit testing
- Test files should be co-located with source files or in a `__tests__` directory
- Run tests via `moon run test` or `pnpm test`

### Git Workflow
- Main branch: `main`
- Pre-commit hooks: Run linting via Moon (`moon run --no-actions :lint`)
- Conventional commits recommended (used by release-please)
- Automated releases via release-please on main branch

## Domain Context
- **oRPC**: A TypeScript-first RPC framework with contract-first API design. Contracts define the shape of procedures (input/output schemas) and routes.
- **MSW**: Mock Service Worker - intercepts network requests for testing/development without changing application code.
- **Contract Procedures**: oRPC procedures have input/output schemas and HTTP route configurations (method, path).
- **Handler Pattern**: The library exposes a `.handler()` method on each procedure that accepts mock data and returns an MSW `HttpHandler`.
- **Zod**: Schema validation library commonly used with oRPC for defining input/output schemas.

### Critical Implementation Paths
- **`createMSWUtilities`**: Core entry point - sets up the Proxy and handles recursive traversal of the oRPC router
- **`createHandler`**: Generates an MSW `HttpHandler` for a specific oRPC procedure, including input deserialization and response handling
- **`getMSWMethods`**: Maps oRPC HTTP methods to corresponding MSW `http` handler functions

### Serialization
Uses `@orpc/openapi-client` serializers:
- `StandardOpenAPIJsonSerializer` - JSON body parsing
- `StandardBracketNotationSerializer` - Query parameter parsing (bracket notation)
- `StandardOpenAPISerializer` - Combined serializer for request deserialization

## Important Constraints
- **OpenAPI oRPC only**: Does NOT support oRPC's `RPCHandler` (no direct HTTP mapping)
- Must maintain compatibility with oRPC contract v1.8.7+
- Must maintain compatibility with MSW v2.11.1+
- ES modules only (`"type": "module"`)
- Zero runtime dependencies beyond `destr` (JSON parsing) and `ufo` (URL utilities)
- TypeScript strict mode compliance

## External Dependencies
- **@orpc/contract**: Provides contract types and `isContractProcedure` utility
- **@orpc/openapi-client**: Provides serializers for OpenAPI-compatible request/response handling
- **msw**: Mock Service Worker for HTTP request interception
- **destr**: Safe JSON parsing with type coercion
- **ufo**: URL manipulation utilities (`joinURL`)
