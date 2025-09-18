# System Patterns: orpc-msw

## System Architecture

`orpc-msw` operates as a utility layer between `@orpc/contract` definitions and Mock Service Worker (MSW). It leverages TypeScript's type inference capabilities to provide a type-safe mocking experience.

## Key Technical Decisions

*   **Proxy-based API**: The `createMSWUtilities` function returns a proxy object that dynamically mirrors the structure of the `orpc` router, allowing for intuitive access to procedure handlers.
*   **OpenAPI `orpc` Focus**: Explicitly designed for OpenAPI-based `orpc` contracts, which define HTTP methods and paths, making them compatible with MSW's request interception model. This decision was made to provide a focused and effective solution for a specific `orpc` variant, avoiding the complexities of `RPCHandler` which does not have a direct HTTP mapping.
*   **MSW Integration**: Utilizes `msw`'s `http` handlers and `HttpResponse` for flexible and powerful request interception and response generation.
*   **Serialization/Deserialization**: Employs `@orpc/openapi-client`'s serializers (`StandardOpenAPIJsonSerializer`, `StandardBracketNotationSerializer`, `StandardOpenAPISerializer`) to correctly handle input deserialization from request bodies and query parameters.

## Design Patterns in Use

*   **Proxy Pattern**: Used to create a dynamic interface that mirrors the `orpc` router structure, allowing method calls to be intercepted and transformed into MSW handlers.
*   **Factory Pattern**: `createMSWUtilities` acts as a factory function, abstracting the complexity of creating MSW handlers for `orpc` procedures.

## Component Relationships

*   `orpc-msw` depends on `@orpc/contract` for contract definitions and `@orpc/openapi-client` for serialization logic.
*   It integrates with `msw` to provide the actual mocking capabilities.
*   Consumers of `orpc-msw` will typically use it in conjunction with a testing framework (e.g., Vitest, Jest) and an `orpc` client.

## Critical Implementation Paths

*   **`createMSWUtilities`**: The core entry point, responsible for setting up the proxy and handling the recursive traversal of the `orpc` router.
*   **`createHandler`**: This function is responsible for generating an `msw` `HttpHandler` for a specific `orpc` procedure, including input deserialization and response handling.
*   **`getMSWMethods`**: Maps `orpc` HTTP methods to corresponding `msw` `http` handler functions.
