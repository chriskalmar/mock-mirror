import { beforeEach, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import type { StatusCode } from 'hono/utils/http-status';
import { MOCK_MIRROR_HEADER } from './const';
import { createMockMirror } from './client';
import server from '.';

const serverUrl = `http://localhost:3211`;

Bun.serve({
  ...server,
  port: 3211,
});

const mockMirror = createMockMirror({
  mockMirrorUrl: serverUrl,
});

const testServiceUrl = 'http://this-service-does-not-exist.local';

const testBackend = new Hono().get('/api/users/:id', async (ctx) => {
  const headers = ctx.req.raw.headers;
  const hasMockMirrorScope = ctx.req.header(MOCK_MIRROR_HEADER);

  const api = hasMockMirrorScope
    ? async (url: string) => fetch(`${serverUrl}${url}`, { headers }) // This is the mock
    : async (url: string) => fetch(`${testServiceUrl}${url}`, { headers }); // This would be the actual service, but we're mocking it

  const result = await api(`/api/users/${ctx.req.param('id')}`);

  return ctx.body(await result.text(), result.status as StatusCode);
});

describe('client', () => {
  beforeEach(async () => {
    await mockMirror(({ reset }) => reset);
  });

  it('should fail if mocks are not provided', async () => {
    await mockMirror(async ({ scope }) => {
      const response = await testClient(testBackend).api.users[':id'].$get(
        { param: { id: '777' } },
        {
          headers: {
            [MOCK_MIRROR_HEADER]: scope,
          },
        },
      );

      expect(response.status).toBe(404);
    });
  });

  it('should be able to mock the service behind the backend', async () => {
    await mockMirror(async ({ addRoute, scope }) => {
      await addRoute({
        pathPattern: '/api/users/*',
        response: 'This is a mock response for the user',
      });

      const response = await testClient(testBackend).api.users[':id'].$get(
        { param: { id: '777' } },
        {
          headers: {
            [MOCK_MIRROR_HEADER]: scope,
          },
        },
      );

      expect(await response.text()).toBe('This is a mock response for the user');
    });
  });

  it('should be able to mock the service behind the backend on the go', async () => {
    await mockMirror(async ({ addRoute, scope }) => {
      {
        const response = await testClient(testBackend).api.users[':id'].$get(
          { param: { id: '777' } },
          {
            headers: {
              [MOCK_MIRROR_HEADER]: scope,
            },
          },
        );

        expect(response.status).toBe(404);
      }

      {
        await addRoute({
          pathPattern: '/api/users/*',
          response: 'This is a mock response for the user',
        });

        const response = await testClient(testBackend).api.users[':id'].$get(
          { param: { id: '777' } },
          {
            headers: {
              [MOCK_MIRROR_HEADER]: scope,
            },
          },
        );

        expect(await response.text()).toBe('This is a mock response for the user');
      }
    });
  });
});
