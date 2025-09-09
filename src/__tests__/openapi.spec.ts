import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { os, type RouterClient } from '@orpc/server'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createMSWUtilities } from '../msw'

const router = os.router({
  greet: os
    .route({
      path: '/greet',
    })
    .handler(() => {
      return 'hello'
    }),
  user: {
    get: os
      .route({ path: '/user' })
      .input(z.string())
      .handler(({ input: id }) => {
        return { id, name: `User ${id}` }
      }),
  },
})

const baseUrl = 'http://localhost:3000/orpc'

const client: RouterClient<typeof router> = createORPCClient(
  new OpenAPILink(router, {
    url: baseUrl,
    fetch: (request, init) => {
      // this is necessary to allow msw to mock it
      return fetch(request, init)
    },
  }),
)

const msw = createMSWUtilities({ router, baseUrl })

const server = setupServer()

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('createMSWUtilities', () => {
  it('should create a handler for a top-level procedure', async () => {
    server.use(
      msw.greet.handler(() => {
        return 'mocked greet'
      }),
    )

    const data = await client.greet()
    expect(data).toBe('mocked greet')
  })

  it('should create a handler for a nested procedure', async () => {
    server.use(
      msw.user.get.handler(({ input }) => {
        return { id: input, name: `Mocked User ${input}` }
      }),
    )

    const userId = '123'
    const data = await client.user.get(userId)
    expect(data).toEqual({ id: userId, name: `Mocked User ${userId}` })
  })

  it('should accept a direct value as mock response', async () => {
    server.use(msw.greet.handler('direct mock value'))

    const data = await client.greet()
    expect(data).toBe('direct mock value')
  })

  it('should accept an async function as mock response', async () => {
    server.use(
      msw.greet.handler(() => {
        return Promise.resolve('async mocked greet')
      }),
    )

    const data = await client.greet()
    expect(data).toBe('async mocked greet')
  })

  it('should accept an HttpResponse object as mock response', async () => {
    const statusCode = 202
    server.use(msw.greet.handler(() => HttpResponse.text('custom http response', { status: statusCode })))

    const response = await fetch(`${baseUrl}/greet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(response.status).toBe(statusCode)
    const data = await response.text()
    expect(data).toBe('custom http response')
  })
})
