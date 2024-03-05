import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';
import { randomUUID } from 'crypto';
import { MockedRoute, MockedRoutes } from './types';

export const createMockMirror = async ({
  mockMirrorUrl,
  defaultRoutes,
}: {
  mockMirrorUrl?: string;
  defaultRoutes?: MockedRoutes;
}) => {
  const api = edenTreaty<typeof app>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210');

  if (defaultRoutes) {
    await api['mock-mirror'].add.post({ routes: defaultRoutes });
  }

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
    scope,
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
