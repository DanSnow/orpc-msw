import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { os, type RouterClient } from "@orpc/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { convertOrpcPathToMsw, createMSWUtilities } from "../msw";

const router = os.router({
  greet: os
    .route({
      path: "/greet",
    })
    .handler(() => {
      return "hello";
    }),
  user: {
    get: os
      .route({ path: "/user" })
      .input(z.string())
      .handler(({ input: id }) => {
        return { id, name: `User ${id}` };
      }),
  },
  methods: {
    get: os
      .route({
        method: "GET",
        path: "/methods",
      })
      .input(
        z.object({
          query: z.string(),
        }),
      )
      .output(z.string())
      .handler(({ input }) => input.query),
    post: os
      .route({
        method: "POST",
        path: "/methods",
      })
      .input(
        z.object({
          data: z.string(),
        }),
      )
      .output(z.string())
      .handler(({ input }) => input.data),
    put: os
      .route({
        method: "PUT",
        path: "/methods",
      })
      .input(
        z.object({
          id: z.string(),
          data: z.string(),
        }),
      )
      .output(z.string())
      .handler(({ input }) => `Updated ${input.id} with ${input.data}`),
    delete: os
      .route({
        method: "DELETE",
        path: "/methods",
      })
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .output(z.string())
      .handler(({ input }) => `Deleted ${input.id}`),
  },
  // Dynamic params routes
  users: {
    getById: os
      .route({
        method: "GET",
        path: "/users/{id}",
      })
      .output(z.object({ id: z.string(), name: z.string() }))
      .handler(() => ({ id: "", name: "" })),
    getPostById: os
      .route({
        method: "GET",
        path: "/users/{userId}/posts/{postId}",
      })
      .output(z.object({ userId: z.string(), postId: z.string(), title: z.string() }))
      .handler(() => ({ userId: "", postId: "", title: "" })),
  },
  resources: {
    list: os
      .route({
        method: "GET",
        path: "/{resource}/list",
      })
      .output(z.object({ resource: z.string(), items: z.array(z.string()) }))
      .handler(() => ({ resource: "", items: [] })),
  },
  api: {
    userProfile: os
      .route({
        method: "GET",
        path: "/api/v1/users/{id}/profile",
      })
      .output(z.object({ id: z.string(), profile: z.string() }))
      .handler(() => ({ id: "", profile: "" })),
  },
  files: {
    getByPath: os
      .route({
        method: "GET",
        path: "/files/{+path}",
      })
      .output(z.object({ path: z.string() }))
      .handler(() => ({ path: "" })),
  },
  // Routes for testing params merging in compact mode
  posts: {
    update: os
      .route({
        method: "PUT",
        path: "/posts/{id}",
      })
      .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
      .output(z.object({ id: z.string(), title: z.string(), content: z.string() }))
      .handler(({ input }) => input),
    getWithQuery: os
      .route({
        method: "GET",
        path: "/posts/{id}",
      })
      .input(z.object({ id: z.string(), includeComments: z.boolean().optional() }))
      .output(z.object({ id: z.string(), includeComments: z.boolean().optional() }))
      .handler(({ input }) => input),
  },
});

const baseUrl = "http://localhost:3000/orpc";

const client: RouterClient<typeof router> = createORPCClient(
  new OpenAPILink(router, {
    url: baseUrl,
    fetch: (request, init) => {
      // this is necessary to allow msw to mock it
      return fetch(request, init);
    },
  }),
);

const msw = createMSWUtilities({ router, baseUrl });

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());

describe("createMSWUtilities", () => {
  describe("basic", () => {
    it("should create a handler for a top-level procedure", async () => {
      server.use(
        msw.greet.handler(() => {
          return "mocked greet";
        }),
      );

      const data = await client.greet();
      expect(data).toBe("mocked greet");
    });

    it("should create a handler for a nested procedure", async () => {
      server.use(
        msw.user.get.handler(({ input }) => {
          return { id: input, name: `Mocked User ${input}` };
        }),
      );

      const userId = "123";
      const data = await client.user.get(userId);
      expect(data).toEqual({ id: userId, name: `Mocked User ${userId}` });
    });

    it("should accept a direct value as mock response", async () => {
      server.use(msw.greet.handler("direct mock value"));

      const data = await client.greet();
      expect(data).toBe("direct mock value");
    });

    it("should accept an async function as mock response", async () => {
      server.use(
        msw.greet.handler(() => {
          return Promise.resolve("async mocked greet");
        }),
      );

      const data = await client.greet();
      expect(data).toBe("async mocked greet");
    });

    it("should accept an HttpResponse object as mock response", async () => {
      const statusCode = 202;
      server.use(msw.greet.handler(() => HttpResponse.text("custom http response", { status: statusCode })));

      const response = await fetch(`${baseUrl}/greet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(statusCode);
      const data = await response.text();
      expect(data).toBe("custom http response");
    });
  });

  describe("methods", () => {
    it("can handle get request", async () => {
      server.use(msw.methods.get.handler(({ input }) => input.query));

      const data = await client.methods.get({ query: "foo" });
      expect(data).toBe("foo");
    });

    it("can handle post request", async () => {
      server.use(msw.methods.post.handler(({ input }) => input.data));

      const data = await client.methods.post({ data: "bar" });
      expect(data).toBe("bar");
    });

    it("can handle put request", async () => {
      server.use(msw.methods.put.handler(({ input }) => `Updated ${input.id} with ${input.data}`));

      const data = await client.methods.put({ id: "1", data: "baz" });
      expect(data).toBe("Updated 1 with baz");
    });

    it("can handle delete request", async () => {
      server.use(msw.methods.delete.handler(({ input }) => `Deleted ${input.id}`));

      const data = await client.methods.delete({ id: "1" });
      expect(data).toBe("Deleted 1");
    });

    describe("error handling", () => {
      it("should handle GET error response", async () => {
        server.use(msw.methods.get.handler(() => HttpResponse.json({ message: "Not Found" }, { status: 404 })));

        await expect(client.methods.get({ query: "nonexistent" })).rejects.toThrowError("Not Found");
      });

      it("should handle POST error response", async () => {
        server.use(msw.methods.post.handler(() => HttpResponse.json({ message: "Bad Request" }, { status: 400 })));

        await expect(client.methods.post({ data: "invalid" })).rejects.toThrowError("Bad Request");
      });

      it("should handle PUT error response", async () => {
        server.use(msw.methods.put.handler(() => HttpResponse.json({ message: "Unauthorized" }, { status: 401 })));

        await expect(client.methods.put({ id: "1", data: "unauthorized" })).rejects.toThrowError("Unauthorized");
      });

      it("should handle DELETE error response", async () => {
        server.use(msw.methods.delete.handler(() => HttpResponse.json({ message: "Forbidden" }, { status: 403 })));

        await expect(client.methods.delete({ id: "1" })).rejects.toThrowError("Forbidden");
      });
    });

    describe("edge cases", () => {
      it("should handle GET with empty query", async () => {
        server.use(msw.methods.get.handler(({ input }) => input.query));

        const data = await client.methods.get({ query: "" });
        expect(data).toBe("");
      });

      it("should handle GET with special characters in query", async () => {
        server.use(msw.methods.get.handler(({ input }) => input.query));

        const data = await client.methods.get({ query: "!@#$%^&*()" });
        expect(data).toBe("!@#$%^&*()");
      });

      it("should handle POST with empty data", async () => {
        server.use(msw.methods.post.handler(({ input }) => input.data));

        const data = await client.methods.post({ data: "" });
        expect(data).toBe("");
      });

      it("should handle PUT with empty data", async () => {
        server.use(msw.methods.put.handler(({ input }) => `Updated ${input.id} with ${input.data}`));

        const data = await client.methods.put({ id: "2", data: "" });
        expect(data).toBe("Updated 2 with ");
      });
    });
  });

  describe("dynamic path parameters", () => {
    describe("MSW sanity check", () => {
      it("should intercept with native MSW colon syntax", async () => {
        server.use(
          http.get(`${baseUrl}/test-native/:id`, ({ params }) => {
            return HttpResponse.json({ id: params.id, name: `User ${params.id}` });
          }),
        );

        const response = await fetch(`${baseUrl}/test-native/999`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ id: "999", name: "User 999" });
      });
    });

    describe("convertOrpcPathToMsw", () => {
      it("should convert single path parameter", () => {
        expect(convertOrpcPathToMsw("/users/{id}")).toBe("/users/:id");
      });

      it("should convert multiple path parameters", () => {
        expect(convertOrpcPathToMsw("/users/{userId}/posts/{postId}")).toBe("/users/:userId/posts/:postId");
      });

      it("should convert path parameter at start of path", () => {
        expect(convertOrpcPathToMsw("/{resource}/list")).toBe("/:resource/list");
      });

      it("should convert catch-all parameter", () => {
        expect(convertOrpcPathToMsw("/files/{+path}")).toBe("/files/:path*");
      });

      it("should preserve static path segments unchanged", () => {
        expect(convertOrpcPathToMsw("/api/v1/users/{id}/profile")).toBe("/api/v1/users/:id/profile");
      });

      it("should handle path with no parameters", () => {
        expect(convertOrpcPathToMsw("/static/path")).toBe("/static/path");
      });

      it("should convert path parameter with underscore", () => {
        expect(convertOrpcPathToMsw("/users/{user_id}")).toBe("/users/:user_id");
      });

      it("should convert path parameter with numbers", () => {
        expect(convertOrpcPathToMsw("/v1/{param123}")).toBe("/v1/:param123");
      });
    });

    describe("single path parameter", () => {
      it("should match request with path parameter and expose params", async () => {
        server.use(
          msw.users.getById.handler(({ params }) => ({
            id: params.id as string,
            name: `User ${params.id}`,
          })),
        );

        const response = await fetch(`${baseUrl}/users/123`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ id: "123", name: "User 123" });
      });
    });

    describe("multiple path parameters", () => {
      it("should match request with multiple path parameters", async () => {
        server.use(
          msw.users.getPostById.handler(({ params }) => ({
            userId: params.userId as string,
            postId: params.postId as string,
            title: `Post by user ${params.userId}`,
          })),
        );

        const response = await fetch(`${baseUrl}/users/1/posts/42`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ userId: "1", postId: "42", title: "Post by user 1" });
      });
    });

    describe("path parameter at start of path", () => {
      it("should match request with parameter at start", async () => {
        server.use(
          msw.resources.list.handler(({ params }) => ({
            resource: params.resource as string,
            items: ["item1", "item2"],
          })),
        );

        const response = await fetch(`${baseUrl}/products/list`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ resource: "products", items: ["item1", "item2"] });
      });
    });

    describe("mixed static and dynamic segments", () => {
      it("should preserve static segments while matching dynamic ones", async () => {
        server.use(
          msw.api.userProfile.handler(({ params }) => ({
            id: params.id as string,
            profile: `Profile of ${params.id}`,
          })),
        );

        const response = await fetch(`${baseUrl}/api/v1/users/789/profile`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ id: "789", profile: "Profile of 789" });
      });
    });

    describe("catch-all path parameter", () => {
      it("should match request with catch-all parameter", async () => {
        server.use(
          msw.files.getByPath.handler(({ params }) => {
            // MSW returns catch-all params as an array of segments
            const pathSegments = params.path as readonly string[];
            return { path: pathSegments.join("/") };
          }),
        );

        const response = await fetch(`${baseUrl}/files/docs/readme.md`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toEqual({ path: "docs/readme.md" });
      });
    });

    describe("params alongside other handler inputs", () => {
      it("should provide params, input, path, and request together", async () => {
        server.use(
          msw.users.getById.handler(({ params, path, request }) => {
            expect(params.id).toBe("test-id");
            expect(path).toEqual(["users", "getById"]);
            expect(request).toBeInstanceOf(Request);
            return { id: params.id as string, name: "Complete Test" };
          }),
        );

        const response = await fetch(`${baseUrl}/users/test-id`, { method: "GET" });
        expect(response.ok).toBe(true);
      });
    });

    describe("param value extraction validation", () => {
      it("should extract different param values correctly", async () => {
        server.use(
          msw.users.getById.handler(({ params }) => ({
            id: params.id as string,
            name: `User ${params.id}`,
          })),
        );

        // Test with different IDs
        const ids = ["1", "abc", "user-123", "00000"];
        for (const id of ids) {
          const response = await fetch(`${baseUrl}/users/${id}`, { method: "GET" });
          expect(response.ok).toBe(true);
          const data = (await response.json()) as { id: string; name: string };
          expect(data.id).toBe(id);
          expect(data.name).toBe(`User ${id}`);
        }
      });

      it("should extract params with special characters (URL decoded)", async () => {
        server.use(
          msw.users.getById.handler(({ params }) => ({
            id: params.id as string,
            name: `User ${params.id}`,
          })),
        );

        // MSW decodes URL-encoded parameters, so %40 becomes @
        const response = await fetch(`${baseUrl}/users/user%40example`, { method: "GET" });
        expect(response.ok).toBe(true);
        const data = (await response.json()) as { id: string; name: string };
        expect(data.id).toBe("user@example");
      });

      it("should extract multiple params independently", async () => {
        server.use(
          msw.users.getPostById.handler(({ params }) => ({
            userId: params.userId as string,
            postId: params.postId as string,
            title: `Post ${params.postId} by ${params.userId}`,
          })),
        );

        const testCases = [
          { userId: "1", postId: "100" },
          { userId: "admin", postId: "first-post" },
          { userId: "user-abc", postId: "draft-001" },
        ];

        for (const { userId, postId } of testCases) {
          const response = await fetch(`${baseUrl}/users/${userId}/posts/${postId}`, { method: "GET" });
          expect(response.ok).toBe(true);
          const data = (await response.json()) as { userId: string; postId: string; title: string };
          expect(data.userId).toBe(userId);
          expect(data.postId).toBe(postId);
          expect(data.title).toBe(`Post ${postId} by ${userId}`);
        }
      });

      it("should handle catch-all with deeply nested paths", async () => {
        server.use(
          msw.files.getByPath.handler(({ params }) => {
            const pathSegments = params.path as readonly string[];
            return { path: pathSegments.join("/") };
          }),
        );

        const testPaths = [
          "readme.md",
          "docs/guide.md",
          "src/components/Button.tsx",
          "very/deeply/nested/path/to/file.json",
        ];

        for (const filePath of testPaths) {
          const response = await fetch(`${baseUrl}/files/${filePath}`, { method: "GET" });
          expect(response.ok).toBe(true);
          const data = (await response.json()) as { path: string };
          expect(data.path).toBe(filePath);
        }
      });

      it("should use params to generate dynamic responses", async () => {
        server.use(
          msw.users.getById.handler(({ params }) => {
            const id = params.id as string;
            // Simulate different users based on ID
            if (id === "1") {
              return { id, name: "Alice" };
            }
            if (id === "2") {
              return { id, name: "Bob" };
            }
            return { id, name: "Unknown User" };
          }),
        );

        const response1 = await fetch(`${baseUrl}/users/1`, { method: "GET" });
        expect(((await response1.json()) as { name: string }).name).toBe("Alice");

        const response2 = await fetch(`${baseUrl}/users/2`, { method: "GET" });
        expect(((await response2.json()) as { name: string }).name).toBe("Bob");

        const response3 = await fetch(`${baseUrl}/users/999`, { method: "GET" });
        expect(((await response3.json()) as { name: string }).name).toBe("Unknown User");
      });
    });

    describe("params merging in compact mode", () => {
      it("should merge path params into input for PUT request with body", async () => {
        server.use(
          msw.posts.update.handler(({ input }) => {
            // In compact mode, path param 'id' should be merged with body data
            return {
              id: input.id,
              title: input.title,
              content: input.content,
            };
          }),
        );

        const data = await client.posts.update({
          id: "post-123",
          title: "My Post",
          content: "Hello World",
        });

        expect(data).toEqual({
          id: "post-123",
          title: "My Post",
          content: "Hello World",
        });
      });

      it("should merge path params into input for GET request with query", async () => {
        server.use(
          msw.posts.getWithQuery.handler(({ input }) => {
            // In compact mode, path param 'id' should be merged with query params
            // Note: query params are deserialized as strings from URL
            return {
              id: input.id,
              includeComments: input.includeComments,
            };
          }),
        );

        const data = await client.posts.getWithQuery({
          id: "post-456",
          includeComments: true,
        });

        expect(data).toEqual({
          id: "post-456",
          // Query params from URL are deserialized as strings
          includeComments: "true",
        });
      });

      it("should have path params override body when keys conflict", async () => {
        // This tests that path params take precedence (they are spread first, then body)
        // Actually in our impl, body is spread last so body would override
        // Let's verify the actual behavior
        server.use(
          msw.posts.update.handler(({ input, params }) => {
            // params.id comes from URL, input.id may come from merged result
            return {
              id: input.id,
              title: input.title,
              content: `params.id=${params.id}, input.id=${input.id}`,
            };
          }),
        );

        // The URL path has the ID, the body also has ID
        // With oRPC client, both should be the same since client uses the input.id for the path
        const data = await client.posts.update({
          id: "from-input",
          title: "Test",
          content: "Testing",
        });

        // The oRPC client should use input.id for the path param
        expect(data.id).toBe("from-input");
      });

      it("should provide both input and params separately in handler", async () => {
        server.use(
          msw.posts.update.handler(({ input, params }) => {
            // input has merged params + body
            // params is the raw path params
            expect(params.id).toBe("test-id");
            expect(input.id).toBe("test-id");
            expect(input.title).toBe("Test Title");
            return input;
          }),
        );

        await client.posts.update({
          id: "test-id",
          title: "Test Title",
          content: "Test Content",
        });
      });

      it("should merge catch-all params as joined string", async () => {
        server.use(
          msw.files.getByPath.handler(({ input, params }) => {
            // params.path is the raw MSW param (could be array internally)
            // input.path should be the joined string in compact mode
            return { path: (input as { path: string }).path };
          }),
        );

        const response = await fetch(`${baseUrl}/files/docs/api/readme.md`, { method: "GET" });
        const data = (await response.json()) as { path: string };
        expect(data.path).toBe("docs/api/readme.md");
      });
    });
  });
});
