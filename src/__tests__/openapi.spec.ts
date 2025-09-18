import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { os, type RouterClient } from "@orpc/server";
import { HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { createMSWUtilities } from "../msw";

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
        })
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
        })
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
        })
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
        })
      )
      .output(z.string())
      .handler(({ input }) => `Deleted ${input.id}`),
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
  })
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
        })
      );

      const data = await client.greet();
      expect(data).toBe("mocked greet");
    });

    it("should create a handler for a nested procedure", async () => {
      server.use(
        msw.user.get.handler(({ input }) => {
          return { id: input, name: `Mocked User ${input}` };
        })
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
        })
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
});
