# Progress: orpc-msw

## What works

- The `orpc-msw` library successfully generates MSW handlers for OpenAPI-based `orpc` contracts.
- Type-safe mocking of `orpc` procedures is supported.
- Flexible response handling (static, dynamic, custom `HttpResponse`/`Response`) is implemented.
- The `README.md` provides a clear overview and basic usage instructions.
- The documentation website (`docs/src/content/docs/index.mdx`, `docs/src/content/docs/guides/basic-usage.md`) is structured and contains relevant information.
- Explicit mentions of OpenAPI `orpc` focus and non-support for `RPCHandler` are included in both `README.md` and `basic-usage.md`.
- Links to MSW and oRPC have been added to `README.md` and `docs/src/content/docs/index.mdx`.
- Links to MSW and oRPC have been added to the first paragraph of `docs/src/content/docs/guides/basic-usage.md`.

## What's left to build

- Further refinement of documentation examples and clarity.
- Potential advanced guides (e.g., error handling strategies, integration with specific testing frameworks beyond basic setup).

## Current status

The core library functionality is complete, and the initial documentation is drafted and updated to reflect the project's scope and usage. The project is ready for review and further development.

## Known issues

- None identified at this time.

## Evolution of project decisions

- Initial decision to use a generic TypeScript library starter template evolved into a focused `orpc-msw` library.
- The scope was narrowed to specifically support OpenAPI-based `orpc` contracts due to their direct HTTP mapping, leading to the explicit exclusion of `orpc`'s `RPCHandler`.
- Documentation was significantly revised from generic template content to `orpc-msw` specific guides and API reference.
- Adjusted link density in `docs/src/content/docs/guides/basic-usage.md` based on user feedback.
