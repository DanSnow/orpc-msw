# Active Context: orpc-msw

## Current Work Focus

The current focus is on drafting and updating the `README.md` and the project's documentation to accurately reflect the purpose and usage of the `orpc-msw` library. This includes clarifying its specific focus on OpenAPI-based `orpc` contracts.

## Recent Changes

*   **`README.md`**: Updated title, description, features, installation, basic usage example, and documentation link. Explicitly clarified that the library is for OpenAPI `orpc` and does not support `orpc`'s `RPCHandler`.
*   **`docs/src/content/docs/index.mdx`**: Revised splash page with `orpc-msw` specific introduction, tagline, and updated "Next steps" cards to link to relevant documentation sections.
*   **`docs/src/content/docs/guides/basic-usage.md`**: Created a new guide covering installation, contract definition, creating MSW handlers, dynamic responses, custom `HttpResponse`/`Response`, and integration with MSW for browser and Node.js environments. Explicitly clarified the OpenAPI `orpc` focus.
*   **`docs/src/content/docs/reference/api-reference.md`**: Created a new API reference document detailing `createMSWUtilities`, `MSWProcedureInput`, and `MSWMockInput` types with examples.

## Next Steps

*   Ensure all documentation is consistent and accurately reflects the library's functionality and limitations.
*   Verify all code examples are correct and runnable.
*   Review the overall clarity and user-friendliness of the documentation.

## Active Decisions and Considerations

*   The decision to explicitly state the OpenAPI `orpc` focus in both `README.md` and documentation is crucial for managing user expectations and preventing misuse.
*   The documentation structure (guides, reference) is designed to provide a clear learning path for users.

## Important Patterns and Preferences

*   **Type Safety**: Emphasize type safety as a core benefit of using `orpc-msw` with `@orpc/contract`.
*   **MSW Integration**: Highlight the seamless integration with MSW and its powerful mocking capabilities.

## Learnings and Project Insights

*   The initial `README.md` and documentation were generic, inherited from a starter template. Significant effort was required to tailor them to the specific purpose of `orpc-msw`.
*   Clarifying the scope (OpenAPI `orpc` only) early in the documentation is vital for user understanding.
