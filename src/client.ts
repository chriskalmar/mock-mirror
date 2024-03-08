import { randomUUID } from 'node:crypto';
import { edenTreaty } from '@elysiajs/eden';
import type { MockedRoute, MockedRoutes } from './types';
import type { app } from '.';

export const createMockMirror = ({
  mockMirrorUrl,
  defaultRoutes,
}: {
  mockMirrorUrl?: string;
  defaultRoutes?: MockedRoutes;
}) => {
  const api = edenTreaty<typeof app>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210', {});

  if (defaultRoutes) {
    void api['mock-mirror'].add.post({ routes: defaultRoutes });
  }

  const getTools = ({ scope }: { scope: string }) => ({
    async addRoute(route: MockedRoute) {
      return api['mock-mirror'].add.post({ scope, routes: [route] });
    },
    async addRoutes(routes: MockedRoutes) {
      return api['mock-mirror'].add.post({ scope, routes });
    },
    async clearScope() {
      return api['mock-mirror']['clear-scope'].post({ scope });
    },
    async reset() {
      return api['mock-mirror'].reset.post();
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
