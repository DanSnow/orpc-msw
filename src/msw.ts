import type {
  AnyContractProcedure,
  AnyContractRouter,
  ContractProcedure,
  InferSchemaInput,
  InferSchemaOutput,
} from '@orpc/contract'
import { isContractProcedure } from '@orpc/contract'
import { type DefaultBodyType, type HttpHandler, HttpResponse, http } from 'msw'
import { joinURL } from 'ufo'
import { destr } from 'destr'

interface MSWProcedureInput<TInput> {
  request: Request
  input: TInput
  path: string[]
}

type MSWMockInput<TInput, TOutput> =
  | TOutput
  | ((
      args: MSWProcedureInput<TInput>,
    ) =>
      | TOutput
      | Response
      | HttpResponse<DefaultBodyType>
      | Promise<TOutput | Response | HttpResponse<DefaultBodyType>>)

interface MSWProcedure<TInput, TOutput> {
  handler: (input: MSWMockInput<TInput, TOutput>) => HttpHandler
}

type MSWUtilities<T extends AnyContractRouter> = T extends ContractProcedure<infer Input, infer Output, any, any>
  ? MSWProcedure<InferSchemaInput<Input>, InferSchemaOutput<Output>>
  : {
      [K in keyof T]: T[K] extends AnyContractRouter ? MSWUtilities<T[K]> : never
    }

function createMSWUtilities<T extends AnyContractRouter>(options: { router: T; baseUrl: string }): MSWUtilities<T> {
  const { router, baseUrl } = options

  function createHandler<TInput, TOutput>(
    proc: AnyContractProcedure,
    path: string[],
    mockResponse: MSWMockInput<TInput, TOutput>,
  ): HttpHandler {
    const routePath = proc['~orpc'].route.path ?? `/${path.join('/')}`
    return http.post(joinURL(baseUrl, routePath), async ({ request }) => {
      const input = destr(await request.text()) as TInput
      let response: TOutput | HttpResponse<DefaultBodyType> | Response

      if (typeof mockResponse === 'function') {
        response = await Promise.resolve(
          (mockResponse as (args: MSWProcedureInput<TInput>) => TOutput | Response | Promise<TOutput | Response>)({
            request,
            input,
            path,
          }),
        )
      } else {
        response = mockResponse
      }

      if (response instanceof HttpResponse || response instanceof Response) {
        return response
      }

      return HttpResponse.json(response as object)
    })
  }

  function createRecursiveProxy<R extends AnyContractRouter>(currentRouter: R, currentPath: string[]): MSWUtilities<R> {
    return new Proxy(
      {},
      {
        get(_, prop: string) {
          const newPath = [...currentPath, prop]
          const procedure = (currentRouter as Record<string, AnyContractRouter>)[prop]

          if (isContractProcedure(procedure)) {
            return {
              handler: (mockResponse: MSWMockInput<any, any>) => createHandler(procedure, newPath, mockResponse),
            }
          }
          if (typeof procedure === 'object' && procedure !== null) {
            return createRecursiveProxy(procedure as AnyContractRouter, newPath)
          }
          return
        },
      },
    ) as MSWUtilities<R>
  }

  if (isContractProcedure(router)) {
    return {
      handler: (mockResponse: MSWMockInput<any, any>) => createHandler(router, [], mockResponse),
    } as MSWUtilities<T>
  }

  return createRecursiveProxy(router, []) as MSWUtilities<T>
}

export { createMSWUtilities }
