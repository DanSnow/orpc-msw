# Proposal: Add Dynamic Params Support

## Summary

Add support for dynamic path parameters in oRPC routes when generating MSW handlers, including exposing path parameter values to mock handler callbacks.

## Problem Statement

oRPC uses curly brace syntax for path parameters (e.g., `/users/{id}`), while MSW uses colon syntax (e.g., `/users/:id`). This mismatch requires conversion when creating MSW handlers from oRPC routes. Additionally, oRPC supports catch-all parameters with `{+param}` syntax for matching slashes. Path parameter values need to be exposed to mock handler callbacks so developers can use them in dynamic responses.

For example, an oRPC route defined as:
```typescript
os.route({ path: "/users/{id}", method: "GET" })
```

Should generate an MSW handler that matches `/users/:id` and provides the extracted `id` parameter value to the handler callback.

## Proposed Solution

Implement a path normalization function that converts oRPC path parameter syntax to MSW-compatible syntax and ensure path parameters are properly exposed to mock handlers via the `params` object.

### Normalization Rules

| oRPC Syntax | MSW Syntax | Description |
|-------------|------------|-------------|
| `{param}` | `:param` | Named parameter (conversion required) |
| `{+param}` | `:param*` | Catch-all parameter (matches slashes) |

### Implementation Location

The conversion should happen in the `createHandler` function in [msw.ts](../../src/msw.ts) at line 102-104, where `routePath` is constructed before being passed to the MSW handler.

## Scope

### In Scope
- Convert oRPC `{param}` syntax to MSW `:param` syntax in route paths
- Convert oRPC `{+param}` catch-all syntax to MSW wildcard syntax
- Expose path parameters to the mock handler callback via `MSWProcedureInput`
- Handle edge cases (multiple params, params at different positions)

### Out of Scope
- Regex-based route matching
- Query parameter handling (already works via existing serializer)

## Benefits

- Enables full oRPC OpenAPI contract support with dynamic routes
- Maintains type safety for path parameters
- Zero breaking changes to existing API

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Regex edge cases in param names | Use well-tested regex pattern; add comprehensive tests |
| Catch-all `{+param}` behavior may differ between oRPC and MSW | Document the behavior; ensure MSW wildcard syntax matches oRPC semantics |

## Related

- [MSW path matching documentation](https://mswjs.io/docs/basics/matching#path-params)
- [oRPC route configuration](https://orpc.unnoq.com/)
