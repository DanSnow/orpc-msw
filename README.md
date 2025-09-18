# orpc-msw

A utility library for simplifying the mocking of `@orpc/contract` procedures (specifically for OpenAPI-based `orpc` contracts) using Mock Service Worker (MSW) for testing. This library is currently designed for OpenAPI `orpc` and does not support `orpc`'s `RPCHandler`.

## ✨ Features

*   **Seamless Integration**: Works directly with `@orpc/contract` for type-safe API definitions.
*   **MSW Powered**: Leverages Mock Service Worker for powerful request interception and mocking capabilities.
*   **Simplified Mocking**: Streamlines the creation of mock handlers for `orpc` procedures.
*   **Type-Safe Responses**: Ensures mock responses adhere to your defined `orpc` contract types.
*   **Flexible Response Handling**: Supports dynamic responses and custom `HttpResponse` or `Response` objects.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v22 or later recommended)
*   [pnpm](https://pnpm.io/) (v10 or later recommended)

### Installation

Install `orpc-msw` and its peer dependencies:

```bash
pnpm add -D orpc-msw @orpc/contract @orpc/openapi-client msw
```

### Basic Usage

Here's a quick example of how to use `orpc-msw` to mock an `orpc` procedure:

First, define your `orpc` contract:

```typescript
// contract.ts
import { os } from "@orpc/server";
import { z } from "zod";

export const myContract = os.router({
  greeter: os
    .route({ method: "GET", path: "/hello" })
    .input(z.object({ name: z.string() }))
    .output(z.object({ message: z.string() }))
});
```

Then, create your MSW handlers using `createMSWUtilities`:

```typescript
// msw-handlers.ts
import { setupWorker } from "msw/browser";
import { createMSWUtilities } from "orpc-msw";
import { myContract } from "./contract";

const msw = createMSWUtilities({
  router: myContract,
  baseUrl: "http://localhost:3000", // Your API base URL
});

export const handlers = [
  msw.greeter.handler(({ input }) => ({
    message: `Hello, ${input.name}! This is a mock response.`,
  })),
];

// In your setup file (e.g., src/mocks/browser.ts for browser environments)
export const worker = setupWorker(...handlers);
```

Start the worker in your application:

```typescript
// main.ts or test-setup.ts
import { worker } from "./msw-handlers";

if (import.meta.env.DEV) {
  worker.start();
}
```

## 📚 Documentation

For more detailed information, guides, and API reference, please visit the [documentation website](https://dansnow.github.io/orpc-msw/).

## 📄 License

This project is licensed under the [MIT License](LICENSE).
