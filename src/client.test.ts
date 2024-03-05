import { beforeEach, describe, expect, it } from 'bun:test';
import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';
import { MOCK_MIRROR_HEADER } from './const';
import { createMockMirror } from './client';
import { Elysia, t } from 'elysia';

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

  it('should be able to mock a service behind a backend', async () => {
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
});
