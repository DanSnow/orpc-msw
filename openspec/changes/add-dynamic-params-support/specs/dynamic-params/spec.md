# Dynamic Path Parameters

Capability for normalizing oRPC path parameters for MSW compatibility and exposing them to mock handlers.

## ADDED Requirements

### Requirement: Path parameter syntax normalization

The library MUST normalize oRPC path parameter syntax for MSW compatibility. oRPC uses curly brace syntax (`{param}`) while MSW uses colon syntax (`:param`), so conversion is required.

#### Scenario: Single path parameter

Given an oRPC route with path `/users/{id}`
When an MSW handler is created for this route
Then the handler MUST convert to `/users/:id` pattern for MSW
And a request to `/users/123` MUST be intercepted by the handler

#### Scenario: Multiple path parameters

Given an oRPC route with path `/users/{userId}/posts/{postId}`
When an MSW handler is created for this route
Then the handler MUST convert to `/users/:userId/posts/:postId` pattern for MSW
And a request to `/users/1/posts/42` MUST be intercepted by the handler

#### Scenario: Path parameter at start of path

Given an oRPC route with path `/{resource}/list`
When an MSW handler is created for this route
Then the handler MUST convert to `/:resource/list` pattern for MSW

#### Scenario: Catch-all path parameter

Given an oRPC route with path `/files/{+path}`
When an MSW handler is created for this route
Then the handler MUST convert to `/files/:path*` pattern for MSW (or equivalent wildcard)
Note: oRPC `{+param}` matches slashes, equivalent to MSW wildcard segments

### Requirement: Path parameter value exposure

The library MUST expose extracted path parameter values to the mock handler callback.

#### Scenario: Access path parameters in handler

Given an oRPC route with path `/users/{id}`
And a mock handler function is provided
When a request to `/users/456` is intercepted
Then the handler callback MUST receive `params` containing `{ id: "456" }`

#### Scenario: Access multiple path parameters

Given an oRPC route with path `/users/{userId}/posts/{postId}`
And a mock handler function is provided
When a request to `/users/1/posts/99` is intercepted
Then the handler callback MUST receive `params` containing `{ userId: "1", postId: "99" }`

### Requirement: Static path segments preserved

The library MUST preserve static path segments unchanged during normalization.

#### Scenario: Mixed static and dynamic segments

Given an oRPC route with path `/api/v1/users/{id}/profile`
When an MSW handler is created for this route
Then the handler MUST convert to `/api/v1/users/:id/profile` pattern for MSW
And static segments `/api/v1/users/` and `/profile` MUST remain unchanged

### Requirement: Path parameter merging based on inputStructure

The library MUST merge path parameters into the input object based on the route's `inputStructure` setting, matching oRPC's behavior.

#### Scenario: Compact mode merges params into input (default)

Given an oRPC route with path `/users/{id}` and default inputStructure (compact)
And a mock handler function is provided
When a request to `/users/456` is intercepted with body `{ "name": "John" }`
Then the handler callback MUST receive `input` containing `{ id: "456", name: "John" }`
Note: Path params are merged with body/query data in compact mode

#### Scenario: Compact mode with GET request

Given an oRPC route with path `/users/{id}` method GET and default inputStructure (compact)
And a mock handler function is provided
When a request to `/users/456?search=test` is intercepted
Then the handler callback MUST receive `input` containing `{ id: "456", search: "test" }`

#### Scenario: Detailed mode keeps params separate

Given an oRPC route with path `/users/{id}` and `inputStructure: 'detailed'`
And a mock handler function is provided
When a request to `/users/456` is intercepted with body `{ "name": "John" }`
Then the handler callback MUST receive `input` containing `{ params: { id: "456" }, body: { name: "John" } }`
Note: In detailed mode, params are NOT merged into the top-level input

#### Scenario: Params always available separately

Given any oRPC route with path parameters
When a request is intercepted
Then the handler callback MUST always receive `params` as a separate field in MSWProcedureInput
Note: The `params` field is always available regardless of inputStructure for cases where handlers need direct access
