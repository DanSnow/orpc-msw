---
editUrl: false
next: false
prev: false
title: "createMSWUtilities"
---

> **createMSWUtilities**\<`T`\>(`options`): `MSWUtilities`\<`T`\>

Defined in: [msw.ts:89](https://github.com/DanSnow/orpc-msw/blob/a203afcc1b7f7abba08733e0d937e155210b7078/src/msw.ts#L89)

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
