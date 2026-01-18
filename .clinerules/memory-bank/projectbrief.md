# Project Brief: orpc-msw

## Core Requirements and Goals

The primary goal of `orpc-msw` is to provide a utility library that simplifies the mocking of `@orpc/contract` procedures using Mock Service Worker (MSW) for testing purposes.

**Key Objectives:**

- Enable type-safe mocking of API endpoints defined by `@orpc/contract`.
- Leverage MSW's powerful request interception capabilities.
- Streamline the process of creating mock handlers for `orpc` procedures.
- Support flexible response handling, including static, dynamic, and custom `HttpResponse` objects.
- Focus specifically on OpenAPI-based `orpc` contracts, explicitly not supporting `orpc`'s `RPCHandler`.

## Project Scope

This project involves developing a TypeScript library and its accompanying documentation. The library will expose a `createMSWUtilities` function to facilitate the mocking process. The documentation will cover installation, basic usage, and an API reference.

## Current Status

The `README.md` and initial documentation files have been drafted and updated to reflect the library's purpose and usage, including the clarification about its focus on OpenAPI `orpc` contracts.
