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

/**
 * The input type for the handler function when providing a dynamic response.
 * @template TInput The expected input type for the oRPC procedure.
 */
interface MSWProcedureInput<TInput> {
  /** The original `Request` object from MSW. */
  request: Request;
  /** The deserialized input for the oRPC procedure, type-inferred from your contract. */
  input: TInput;
  /** An array of strings representing the path to the current procedure within the contract router. */
  path: string[];
  /** The extracted path parameters from the URL (e.g., `{ id: "123" }` for `/users/:id`). */
  params: Record<string, string | readonly string[] | undefined>;
}

/**
 * The type for the mock response provided to the `handler` function.
 * This type allows you to define your mock response in several ways:
 * - Direct `TOutput`: Provide a static object that matches the `output` schema of your oRPC procedure.
 * - Function: Provide a function that receives an `MSWProcedureInput` object and returns:
 *   - A `TOutput` object (static or dynamically generated).
 *   - A standard `Response` object.
 *   - An `HttpResponse` object from `msw`.
 *   - A `Promise` resolving to any of the above.
 * @template TInput The expected input type for the oRPC procedure.
 * @template TOutput The expected output type for the oRPC procedure.
 */
type MSWMockInput<TInput, TOutput> =
  | TOutput
  | ((
      args: MSWProcedureInput<TInput>,
    ) =>
      | TOutput
      | Response
      | HttpResponse<DefaultBodyType>
      | Promise<TOutput | Response | HttpResponse<DefaultBodyType>>);

/**
 * Represents a single oRPC procedure within the MSW utilities, providing a `handler` function.
 * @template TInput The expected input type for the oRPC procedure.
 * @template TOutput The expected output type for the oRPC procedure.
 */
interface MSWProcedure<TInput, TOutput> {
  /**
   * A function to define the mock response for this oRPC procedure.
   * It accepts either a direct output value or a function that dynamically generates the response.
   * @param input The mock input, which can be a static `TOutput` or a function returning `TOutput`, `Response`, or `HttpResponse`.
   * @returns An MSW `HttpHandler` that can be used with `setupServer` or `setupWorker`.
   */
  handler: (input: MSWMockInput<TInput, TOutput>) => HttpHandler;
}

/**
 * A utility object that mirrors the structure of your oRPC contract,
 * where each procedure is replaced with an object containing a `handler` function.
 * @template T The oRPC contract router type.
 */
// biome-ignore lint/suspicious/noExplicitAny: it need to be any here to accept any input
type MSWUtilities<T extends AnyContractRouter> =
  T extends ContractProcedure<infer Input, infer Output, any, any>
    ? MSWProcedure<InferSchemaInput<Input>, InferSchemaOutput<Output>>
    : {
        [K in keyof T]: T[K] extends AnyContractRouter ? MSWUtilities<T[K]> : never;
      };

/**
 * The main function to create MSW handlers from your `@orpc/contract` router.
 * @template T The oRPC contract router type.
 * @param options An object containing the configuration for `orpc-msw`.
 * @param options.router Your `@orpc/contract` router definition. This is used to infer the types and structure of your API.
 * @param options.baseUrl The base URL of your API. This is used to match incoming requests with the defined contract routes.
 * @returns A utility object that mirrors the structure of your oRPC contract, where each procedure is replaced with an object containing a `handler` function.
 */
function createMSWUtilities<T extends AnyContractRouter>(options: { router: T; baseUrl: string }): MSWUtilities<T> {
  const { router, baseUrl } = options;
  const jsonSerializer = new StandardOpenAPIJsonSerializer();
  const bracketNotationSerializer = new StandardBracketNotationSerializer();
  const serializer = new StandardOpenAPISerializer(jsonSerializer, bracketNotationSerializer);

  function createHandler<TInput, TOutput>(
    proc: AnyContractProcedure,
    path: string[],
    mockResponse: MSWMockInput<TInput, TOutput>,
  ): HttpHandler {
    const { route } = proc["~orpc"];
    const routePath = route.path ?? `/${path.join("/")}`;
    const mswPath = convertOrpcPathToMsw(routePath);
    const httpHandler = getMSWMethods(route.method);
    return httpHandler(joinURL(baseUrl, mswPath), async ({ request, params }) => {
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
            params,
          }),
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
      },
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

/**
 * Normalizes oRPC path parameter syntax for MSW compatibility.
 * oRPC uses curly brace syntax (`{param}`) while MSW uses colon syntax (`:param`).
 * oRPC also supports catch-all parameters with `{+param}` which converts to `:param*`.
 * @param path The oRPC-style path with curly brace parameters
 * @returns The normalized path compatible with MSW
 */
function convertOrpcPathToMsw(path: string): string {
  return path
    // Convert catch-all parameters: {+param} -> :param*
    .replace(/\{\+([a-zA-Z_][a-zA-Z0-9_]*)\}/g, ":$1*")
    // Convert named parameters: {param} -> :param
    .replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, ":$1");
}

export { createMSWUtilities, convertOrpcPathToMsw };
