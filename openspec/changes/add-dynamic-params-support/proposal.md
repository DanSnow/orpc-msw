# Proposal: Add Dynamic Params Support

## Summary

Add support for converting oRPC dynamic path parameters (`:param` syntax) to MSW path parameters (`{param}` syntax) when generating MSW handlers.

## Problem Statement

oRPC uses Express-style path parameters with colon notation (e.g., `/users/:id`), while MSW uses curly brace notation (e.g., `/users/{id}`). Currently, `orpc-msw` passes the oRPC path directly to MSW without conversion, which means dynamic path parameters are not properly matched by MSW handlers.

For example, an oRPC route defined as:
```typescript
os.route({ path: "/users/:id", method: "GET" })
```

Should generate an MSW handler that matches `/users/{id}`, but currently it would try to match the literal path `/users/:id`.

## Proposed Solution

Implement a path conversion function that transforms oRPC path parameter syntax to MSW syntax before passing the path to MSW's `http.*` methods.

### Conversion Rules

| oRPC Syntax | MSW Syntax | Description |
|-------------|------------|-------------|
| `:param` | `{param}` | Named parameter |
| `:param?` | `{param}` | Optional parameter (MSW handles optionality differently) |

### Implementation Location

The conversion should happen in the `createHandler` function in [msw.ts](../../src/msw.ts) at line 102-104, where `routePath` is constructed before being passed to the MSW handler.

## Scope

### In Scope
- Convert `:param` syntax to `{param}` syntax in route paths
- Expose path parameters to the mock handler callback via `MSWProcedureInput`
- Handle edge cases (multiple params, params at different positions, optional params)

### Out of Scope
- Wildcard routes (e.g., `*` or `**`)
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
| Optional param behavior differs between oRPC and MSW | Document the behavior difference; MSW treats all params as required in path matching |

## Related

- [MSW path matching documentation](https://mswjs.io/docs/basics/matching#path-params)
- [oRPC route configuration](https://orpc.unnoq.com/)
