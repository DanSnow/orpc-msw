# Dynamic Path Parameters

Capability for converting oRPC path parameters to MSW format and exposing them to mock handlers.

## ADDED Requirements

### Requirement: Path parameter syntax conversion

The library MUST convert oRPC path parameter syntax (`:param`) to MSW path parameter syntax (`{param}`) when creating handlers.

#### Scenario: Single path parameter

Given an oRPC route with path `/users/:id`
When an MSW handler is created for this route
Then the handler MUST match requests to `/users/{id}` pattern
And a request to `/users/123` MUST be intercepted by the handler

#### Scenario: Multiple path parameters

Given an oRPC route with path `/users/:userId/posts/:postId`
When an MSW handler is created for this route
Then the handler MUST match requests to `/users/{userId}/posts/{postId}` pattern
And a request to `/users/1/posts/42` MUST be intercepted by the handler

#### Scenario: Path parameter at start of path

Given an oRPC route with path `/:resource/list`
When an MSW handler is created for this route
Then the handler MUST match requests to `/{resource}/list` pattern

#### Scenario: Optional path parameter

Given an oRPC route with path `/users/:id?`
When an MSW handler is created for this route
Then the handler MUST convert it to `{id}` syntax for MSW
Note: MSW handles optionality through its own matching rules

### Requirement: Path parameter value exposure

The library MUST expose extracted path parameter values to the mock handler callback.

#### Scenario: Access path parameters in handler

Given an oRPC route with path `/users/:id`
And a mock handler function is provided
When a request to `/users/456` is intercepted
Then the handler callback MUST receive `params` containing `{ id: "456" }`

#### Scenario: Access multiple path parameters

Given an oRPC route with path `/users/:userId/posts/:postId`
And a mock handler function is provided
When a request to `/users/1/posts/99` is intercepted
Then the handler callback MUST receive `params` containing `{ userId: "1", postId: "99" }`

### Requirement: Static path segments preserved

The library MUST preserve static path segments unchanged during conversion.

#### Scenario: Mixed static and dynamic segments

Given an oRPC route with path `/api/v1/users/:id/profile`
When an MSW handler is created for this route
Then the handler MUST match requests to `/api/v1/users/{id}/profile` pattern
And static segments `/api/v1/users/` and `/profile` MUST remain unchanged
