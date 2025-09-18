import type {
  AnyContractProcedure,
  AnyContractRouter,
  ContractProcedure,
  HTTPMethod,
  InferSchemaInput,
  InferSchemaOutput,
} from "@orpc/contract";
import { isContractProcedure } from "@orpc/contract";
import {
  StandardBracketNotationSerializer,
  StandardOpenAPIJsonSerializer,
  StandardOpenAPISerializer,
} from "@orpc/openapi-client/standard";
import { destr } from "destr";
import { type DefaultBodyType, type HttpHandler, type HttpRequestHandler, HttpResponse, http } from "msw";
import { joinURL } from "ufo";

interface MSWProcedureInput<TInput> {
  request: Request;
  input: TInput;
  path: string[];
}

type MSWMockInput<TInput, TOutput> =
  | TOutput
  | ((
      args: MSWProcedureInput<TInput>
    ) =>
      | TOutput
      | Response
      | HttpResponse<DefaultBodyType>
      | Promise<TOutput | Response | HttpResponse<DefaultBodyType>>);

interface MSWProcedure<TInput, TOutput> {
  handler: (input: MSWMockInput<TInput, TOutput>) => HttpHandler;
}

// biome-ignore lint/suspicious/noExplicitAny: it need to be any here to accept any input
type MSWUtilities<T extends AnyContractRouter> = T extends ContractProcedure<infer Input, infer Output, any, any>
  ? MSWProcedure<InferSchemaInput<Input>, InferSchemaOutput<Output>>
  : {
      [K in keyof T]: T[K] extends AnyContractRouter ? MSWUtilities<T[K]> : never;
    };

function createMSWUtilities<T extends AnyContractRouter>(options: { router: T; baseUrl: string }): MSWUtilities<T> {
  const { router, baseUrl } = options;
  const jsonSerializer = new StandardOpenAPIJsonSerializer();
  const bracketNotationSerializer = new StandardBracketNotationSerializer();
  const serializer = new StandardOpenAPISerializer(jsonSerializer, bracketNotationSerializer);

  function createHandler<TInput, TOutput>(
    proc: AnyContractProcedure,
    path: string[],
    mockResponse: MSWMockInput<TInput, TOutput>
  ): HttpHandler {
    const { route } = proc["~orpc"];
    const routePath = route.path ?? `/${path.join("/")}`;
    const httpHandler = getMSWMethods(route.method);
    return httpHandler(joinURL(baseUrl, routePath), async ({ request }) => {
      const input =
        route.method === "GET"
          ? (serializer.deserialize(new URL(request.url).searchParams) as TInput)
          : (destr(await request.text()) as TInput);

      let response: TOutput | HttpResponse<DefaultBodyType> | Response;

      if (typeof mockResponse === "function") {
        response = await Promise.resolve(
          (mockResponse as (args: MSWProcedureInput<TInput>) => TOutput | Response | Promise<TOutput | Response>)({
            request,
            input,
            path,
          })
        );
      } else {
        response = mockResponse;
      }

      if (response instanceof HttpResponse || response instanceof Response) {
        return response;
      }

      return HttpResponse.json(response as object);
    });
  }

  function createRecursiveProxy<R extends AnyContractRouter>(currentRouter: R, currentPath: string[]): MSWUtilities<R> {
    return new Proxy(
      {},
      {
        get(_, prop: string) {
          const newPath = [...currentPath, prop];
          const procedure = (currentRouter as Record<string, AnyContractRouter>)[prop];

          if (isContractProcedure(procedure)) {
            return {
              // biome-ignore lint/suspicious/noExplicitAny: it need to be any here to accept any input
              handler: (mockResponse: MSWMockInput<any, any>) => createHandler(procedure, newPath, mockResponse),
            };
          }
          if (typeof procedure === "object" && procedure !== null) {
            return createRecursiveProxy(procedure as AnyContractRouter, newPath);
          }
          return;
        },
      }
    ) as MSWUtilities<R>;
  }

  if (isContractProcedure(router)) {
    return {
      // biome-ignore lint/suspicious/noExplicitAny: it need to be any here to accept any input
      handler: (mockResponse: MSWMockInput<any, any>) => createHandler(router, [], mockResponse),
    } as MSWUtilities<T>;
  }

  return createRecursiveProxy(router, []) as MSWUtilities<T>;
}

const mswMethods: Record<HTTPMethod, HttpRequestHandler> = {
  GET: http.get,
  POST: http.post,
  HEAD: http.head,
  DELETE: http.delete,
  PATCH: http.patch,
  PUT: http.put,
};

function getMSWMethods(method?: HTTPMethod) {
  return method != null ? (mswMethods[method] ?? http.post) : http.post;
}

export { createMSWUtilities };
