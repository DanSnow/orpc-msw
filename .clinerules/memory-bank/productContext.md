# Product Context: orpc-msw

## Why this project exists

`orpc-msw` addresses the challenge of testing applications that interact with `@orpc/contract` defined APIs. Traditional mocking approaches can be cumbersome and lack type safety, especially when dealing with complex API contracts. This library provides a streamlined, type-safe solution for mocking these APIs during development and testing.

## Problems it solves

- **Lack of Type Safety in Mocks**: Ensures that mock responses adhere to the `@orpc/contract` definitions, preventing common errors due to type mismatches.
- **Complex Mock Setup**: Simplifies the creation of MSW handlers for `orpc` procedures, reducing boilerplate code.
- **Inconsistent Testing Environments**: Provides a consistent way to mock API interactions across different testing environments (unit, integration, end-to-end).
- **Focus on OpenAPI `orpc`**: Specifically targets OpenAPI-based `orpc` contracts, which have a defined HTTP method and path, making them suitable for MSW interception.

## How it should work

The library should expose a `createMSWUtilities` function that takes an `orpc` router and a base URL. This function should return a proxy object that mirrors the structure of the `orpc` router. Each procedure in the router should have a `handler` method that accepts a mock response. The mock response can be a static value, a function for dynamic responses, or an `HttpResponse`/`Response` object for fine-grained control.

## User experience goals

- **Developer-Friendly**: Easy to integrate and use with existing `@orpc/contract` and MSW setups.
- **Intuitive API**: The API should feel natural and mirror the structure of the `orpc` contract.
- **Reliable Testing**: Enable developers to write robust and reliable tests for their `orpc` API integrations.
- **Clear Documentation**: Comprehensive documentation that guides users from installation to advanced usage.
