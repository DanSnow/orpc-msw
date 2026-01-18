# Tasks: Add Dynamic Params Support

## Implementation Tasks

### 1. Add path normalization utility function
- [x] Create `convertOrpcPathToMsw(path: string): string` function in `msw.ts`
- [x] Convert oRPC curly brace syntax `{param}` to MSW colon syntax `:param`
- [x] Convert catch-all syntax `{+param}` to MSW wildcard syntax `:param*`

**Validation**: Unit tests for normalization function with various path patterns

### 2. Integrate normalization in handler creation
- [x] Call `convertOrpcPathToMsw()` on `routePath` before passing to MSW handler
- [x] Location: `createHandler` function around line 104

**Validation**: Existing tests continue to pass (no regression)

### 3. Expose path params in MSWProcedureInput
- [x] Extract path parameters from MSW request info
- [x] Add `params: Record<string, string | readonly string[] | undefined>` to `MSWProcedureInput` interface
- [x] Pass params to mock handler callback

**Validation**: New tests verify params are accessible in handler

### 4. Add comprehensive tests
- [x] Test single param: `/users/{id}` -> `/users/:id` -> matches `/users/123`
- [x] Test multiple params: `/users/{userId}/posts/{postId}` -> `/users/:userId/posts/:postId`
- [x] Test param at start: `/{resource}/list` -> `/:resource/list`
- [x] Test catch-all param: `/files/{+path}` -> `/files/:path*`
- [x] Test mixed static and dynamic segments: `/api/v1/users/{id}/profile`
- [x] Test param value extraction in mock handler

**Validation**: All new tests pass

### 5. Update documentation
- [x] Add JSDoc comments to new function and interface changes
- [x] Update type definitions for `MSWProcedureInput`

**Validation**: Types compile without errors

## Dependencies

- Task 1 must complete before Task 2
- Task 2 must complete before Task 3
- Tasks 4 and 5 can be done in parallel after Task 3

## Parallelizable Work

- Test writing (Task 4) can begin once Task 2 is complete for basic tests
- Documentation (Task 5) can be done in parallel with testing
