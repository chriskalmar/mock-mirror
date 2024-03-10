import { randomUUID } from 'node:crypto';
import type { ClientRequestOptions } from 'hono';
import { hc } from 'hono/client';
import type { MockedRoute, MockedRoutes } from './types';
import type { App } from '.';

export const createMockMirror = ({
  mockMirrorUrl,
  defaultRoutes,
  options,
}: {
  mockMirrorUrl?: string;
  defaultRoutes?: MockedRoutes;
  options?: ClientRequestOptions;
}) => {
  const client = hc<App>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210', options);

  if (defaultRoutes) {
    void client['mock-mirror'].add.$post({ json: { routes: defaultRoutes } });
  }

  const getTools = ({ scope }: { scope: string }) => ({
    async addRoute(route: MockedRoute) {
      return client['mock-mirror'].add.$post({ json: { scope, routes: [route] } });
    },
    async addRoutes(routes: MockedRoutes) {
      return client['mock-mirror'].add.$post({ json: { scope, routes } });
    },
    async clearScope() {
      return client['mock-mirror']['clear-scope'].$post({ json: { scope } });
    },
    async reset() {
      return client['mock-mirror'].reset.$post();
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
