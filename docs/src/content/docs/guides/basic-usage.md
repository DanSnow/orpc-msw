---
title: Basic Usage
description: Get started with orpc-msw for mocking your @orpc/contract APIs.
---

`orpc-msw` simplifies the process of creating mock handlers for your [`@orpc/contract`](https://orpc.unnoq.com) defined APIs (specifically for OpenAPI-based `orpc` contracts) using [Mock Service Worker (MSW)](https://mswjs.io). This library is currently designed for OpenAPI `orpc` and does not support `orpc`'s `RPCHandler`. This guide will walk you through the basic setup and usage.

## Installation

First, install `orpc-msw` and its peer dependencies:

```bash
pnpm add -D orpc-msw @orpc/contract @orpc/openapi-client msw
```

## Defining Your Contract

Before you can mock your API, you need to define your `@orpc/contract`. This contract provides the type-safe definitions that `orpc-msw` will use.

```typescript
// src/contract.ts
import { os } from "@orpc/server";
import { z } from "zod";

export const appContract = os.router({
  users: {
    getById: os
      .route({ method: "GET", path: "/users/:id" })
      .input(z.object({ id: z.string() }))
      .output(z.object({ id: z.string(), name: z.string(), email: z.string() })),
    create: os
      .route({ method: "POST", path: "/users" })
      .input(z.object({ name: z.string(), email: z.string() }))
      .output(z.object({ id: z.string(), name: z.string(), email: z.string() })),
  },
  posts: {
    getAll: os
      .route({ method: "GET", path: "/posts" })
      .input(z.void())
      .output(z.array(z.object({ id: z.string(), title: z.string(), content: z.string() }))),
  },
});
```

## Creating MSW Handlers

Use the `createMSWUtilities` function to generate MSW handlers from your `orpc` contract.

```typescript
// src/mocks/handlers.ts
import { HttpResponse } from "msw";
import { createMSWUtilities } from "orpc-msw";
import { appContract } from "../contract";

const msw = createMSWUtilities({
  router: appContract,
  baseUrl: "http://localhost:3000", // Your API base URL
});

export const handlers = [
  // Mock a GET request for getting a user by ID
  msw.users.getById.handler(({ input }) => {
    if (input.id === "1") {
      return { id: "1", name: "John Doe", email: "john.doe@example.com" };
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Mock a POST request for creating a user
  msw.users.create.handler(async ({ input }) => {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: "new-id-123", name: input.name, email: input.email };
  }),

  // Mock a GET request for all posts
  msw.posts.getAll.handler(() => [
    { id: "post-1", title: "First Post", content: "This is the content of the first post." },
    { id: "post-2", title: "Second Post", content: "This is the content of the second post." },
  ]),
];
```

### Dynamic Responses

You can return a function from your handler to create dynamic responses based on the incoming request:

```typescript
// src/mocks/handlers.ts (continued)
// ...
msw.users.getById.handler(({ request, input, path }) => {
  console.log("Received request for user:", input.id, "at path:", path.join("/"));
  // Access the original request object if needed
  const originalUrl = request.url;

  if (input.id === "dynamic-user") {
    return { id: "dynamic-user", name: "Dynamic User", email: "dynamic@example.com" };
  }
  return new HttpResponse(null, { status: 404 });
}),
// ...
```

### Custom `HttpResponse` or `Response`

You can also return `HttpResponse` or standard `Response` objects directly for more control over the response:

```typescript
// src/mocks/handlers.ts (continued)
// ...
msw.users.create.handler(() => {
  return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
}),
// ...
```

## Integrating with MSW

Depending on your environment (browser or Node.js), you'll need to set up MSW.

### Browser Environment

```typescript
// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Start the worker in your application's entry point (e.g., main.ts)
// if (import.meta.env.DEV) {
//   worker.start();
// }
```

### Node.js Environment (for testing)

```typescript
// src/mocks/node.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// In your test setup file (e.g., vitest.setup.ts)
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
```
