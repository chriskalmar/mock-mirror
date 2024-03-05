import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';
import { randomUUID } from 'crypto';
import { MOCK_MIRROR_HEADER } from './const';
import { MockedRoute, MockedRoutes } from './types';

export const createMockMirror = async ({ mockMirrorUrl }: { mockMirrorUrl?: string }) => {
  const api = edenTreaty<typeof app>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210');

  const getTools = ({ scope }: { scope: string }) => ({
    addRoute: async (route: MockedRoute) => {
      return await api['mock-mirror'].add.post({ scope, routes: [route] });
    },
    addRoutes: async (routes: MockedRoutes) => {
      return await api['mock-mirror'].add.post({ scope, routes });
    },
    clearScope: async () => {
      return await api['mock-mirror']['clear-scope'].post({ scope });
    },
    reset: async () => {
      return await api['mock-mirror'].reset.post();
    },
  });

  return (
    integrationTest: (tools: ReturnType<typeof getTools>) => unknown,
    options?: {
      scope?: string;
    },
  ) => {
    const scope = options?.scope ?? randomUUID();

    return integrationTest(
      getTools({
        scope,
      }),
    );
  };
};

const mockMirror = await createMockMirror({});

it('should be able to clear scope', async () => {
  await mockMirror(async ({ addRoute }) => {
    await addRoute({
      pathPattern: '/api/users/*',
      method: 'GET',
      response: 'any',
    });
  });
});
