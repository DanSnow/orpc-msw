---
editUrl: false
next: false
prev: false
title: "createMSWUtilities"
---

> **createMSWUtilities**\<`T`\>(`options`): `MSWUtilities`\<`T`\>

Defined in: [msw.ts:90](https://github.com/DanSnow/orpc-msw/blob/022c975d69e61e4fbb8750c6c6002d9d9c13e019/src/msw.ts#L90)

The main function to create MSW handlers from your `@orpc/contract` router.

## Type Parameters

### T

`T` *extends* `AnyContractRouter`

The oRPC contract router type.

## Parameters

### options

An object containing the configuration for `orpc-msw`.

#### baseUrl

`string`

The base URL of your API. This is used to match incoming requests with the defined contract routes.

#### router

`T`

Your `@orpc/contract` router definition. This is used to infer the types and structure of your API.

## Returns

`MSWUtilities`\<`T`\>

A utility object that mirrors the structure of your oRPC contract, where each procedure is replaced with an object containing a `handler` function.
