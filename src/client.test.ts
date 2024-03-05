import { beforeEach, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { app } from '.';
import { MOCK_MIRROR_HEADER } from './const';
import { createMockMirror } from './client';

const serverUrl = `http://localhost:${app.server?.port}`;

let mockMirror = await createMockMirror({ mockMirrorUrl: serverUrl });

const testServiceUrl = 'http://this-service-does-not-exist.local';

const testBackend = new Elysia()
  .derive(({ headers: originalHeaders }) => {
    const headers = originalHeaders as Record<string, string>;

    const api = headers[MOCK_MIRROR_HEADER]
      ? (url: string) => fetch(`${serverUrl}${url}`, { headers }) // this is the mock
      : (url: string) => fetch(`${testServiceUrl}${url}`, { headers }); // this would be the actual service, but we're mocking it

    return {
      api,
    };
  })
  .get('/api/users/:id', ({ params, api }) => {
    return api(`/api/users/${params.id}`);
  })
  .listen(9898);

const testBackendUrl = `http://${testBackend.server?.hostname}:${testBackend.server?.port}`;

describe('client', () => {
  beforeEach(async () => {
    await mockMirror(({ reset }) => reset);
  });

  it('should fail if mocks are not provided', async () => {
    await mockMirror(async ({ scope }) => {
      const response = await fetch(`${testBackendUrl}/api/users/777`, {
        headers: {
          [MOCK_MIRROR_HEADER]: scope,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  it('should be able to mock the service behind the backend', async () => {
    await mockMirror(async ({ addRoute, scope }) => {
      await addRoute({
        pathPattern: '/api/users/*',
        response: 'This is a mock response for the user',
      });

      const response = await fetch(`${testBackendUrl}/api/users/777`, {
        headers: {
          [MOCK_MIRROR_HEADER]: scope,
        },
      });

      expect(await response.text()).toBe('This is a mock response for the user');
    });
  });

  it('should be able to mock the service behind the backend on the go', async () => {
    await mockMirror(async ({ addRoute, scope }) => {
      {
        const response = await fetch(`${testBackendUrl}/api/users/777`, {
          headers: {
            [MOCK_MIRROR_HEADER]: scope,
          },
        });

        expect(response.status).toBe(404);
      }
      {
        await addRoute({
          pathPattern: '/api/users/*',
          response: 'This is a mock response for the user',
        });

        const response = await fetch(`${testBackendUrl}/api/users/777`, {
          headers: {
            [MOCK_MIRROR_HEADER]: scope,
          },
        });

        expect(await response.text()).toBe('This is a mock response for the user');
      }
    });
  });
});
