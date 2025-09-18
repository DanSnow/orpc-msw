# Tech Context: orpc-msw

## Technologies Used

*   **TypeScript**: Primary language for development, ensuring type safety and better maintainability.
*   **@orpc/contract**: Used for defining API contracts in a type-safe manner.
*   **@orpc/openapi-client**: Provides serializers for handling input deserialization from requests.
*   **MSW (Mock Service Worker)**: The core mocking library used for intercepting HTTP requests.
*   **Zod**: Used for schema validation within `@orpc/contract` definitions.
*   **tsdown**: Build system for compiling the TypeScript library.
*   **Vitest**: Testing framework for unit and integration tests.
*   **Biome & Ultracite**: Code formatter and linter for maintaining code quality and consistency.
*   **Moon**: Monorepo management tool.
*   **Astro + Starlight**: Used for building the documentation website.

## Development Setup

*   **Node.js**: Runtime environment (v22 or later recommended).
*   **pnpm**: Package manager (v8 or later recommended).
*   **VSCode**: Recommended IDE with relevant extensions for TypeScript, Biome, etc.

## Technical Constraints

*   **OpenAPI `orpc` Only**: The library is specifically designed for OpenAPI-based `orpc` contracts and does not support `orpc`'s `RPCHandler` due to its lack of direct HTTP mapping.
*   **MSW Dependency**: Requires `msw` as a peer dependency for its core functionality.

## Dependencies

### Production Dependencies

*   `destr`: For robust deserialization of request bodies.
*   `ufo`: For URL manipulation (e.g., `joinURL`).

### Peer Dependencies

*   `@orpc/contract`: For defining API contracts.
*   `@orpc/openapi-client`: For OpenAPI-specific serialization/deserialization.
*   `msw`: The Mock Service Worker library.

### Development Dependencies

*   `@biomejs/biome`: Code formatter and linter.
*   `@moonrepo/cli`: Moon monorepo tool.
*   `@orpc/client`, `@orpc/openapi`, `@orpc/server`: Potentially for testing or examples.
*   `@tsconfig/node22`: TypeScript configuration.
*   `tsdown`: Build tool.
*   `typescript`: TypeScript compiler.
*   `ultracite`: Biome rules.
*   `vite`: Build tool for documentation.
*   `vitest`: Testing framework.
*   `zod`: Schema validation library.

## Tool Usage Patterns

*   `pnpm install`: To install dependencies.
*   `pnpm build`: To build the library.
*   `pnpm test`: To run tests.
*   `pnpm biome check --write --unsafe`: To lint and format code.
*   `cd docs && pnpm dev`: To run the documentation site locally.
