# Tasks: Add Dynamic Params Support

## Implementation Tasks

### 1. Add path conversion utility function
- [ ] Create `convertOrpcPathToMsw(path: string): string` function in `msw.ts`
- [ ] Convert `:paramName` to `{paramName}` using regex
- [ ] Handle optional params (`:paramName?` -> `{paramName}`)
- [ ] Preserve non-param path segments unchanged

**Validation**: Unit tests for conversion function with various path patterns

### 2. Integrate conversion in handler creation
- [ ] Call `convertOrpcPathToMsw()` on `routePath` before passing to MSW handler
- [ ] Location: `createHandler` function around line 104

**Validation**: Existing tests continue to pass (no regression)

### 3. Expose path params in MSWProcedureInput
- [ ] Extract path parameters from MSW request info
- [ ] Add `params: Record<string, string>` to `MSWProcedureInput` interface
- [ ] Pass params to mock handler callback

**Validation**: New tests verify params are accessible in handler

### 4. Add comprehensive tests
- [ ] Test single param: `/users/:id` -> matches `/users/123`
- [ ] Test multiple params: `/users/:userId/posts/:postId`
- [ ] Test param at start: `/:resource/list`
- [ ] Test optional param handling: `/users/:id?`
- [ ] Test mixed static and dynamic segments: `/api/v1/users/:id/profile`
- [ ] Test param value extraction in mock handler

**Validation**: All new tests pass

### 5. Update documentation
- [ ] Add JSDoc comments to new function and interface changes
- [ ] Update type definitions for `MSWProcedureInput`

**Validation**: Types compile without errors

## Dependencies

- Task 1 must complete before Task 2
- Task 2 must complete before Task 3
- Tasks 4 and 5 can be done in parallel after Task 3

## Parallelizable Work

- Test writing (Task 4) can begin once Task 2 is complete for basic tests
- Documentation (Task 5) can be done in parallel with testing
