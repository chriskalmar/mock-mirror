import { randomUUID } from 'node:crypto';
import { hc } from 'hono/client';
import type { MockedRoute, MockedRoutes } from './types';
import type { MockMirrorRoutesType } from '.';

export const createMockMirror = ({
  mockMirrorUrl,
  defaultRoutes,
}: {
  mockMirrorUrl?: string;
  defaultRoutes?: MockedRoutes;
}) => {
  const client = hc<MockMirrorRoutesType>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210');

  if (defaultRoutes) {
    void client.add.$post({ json: { routes: defaultRoutes } });
  }

  const getTools = ({ scope }: { scope: string }) => ({
    async addRoute(route: MockedRoute) {
      return client.add.$post({ json: { scope, routes: [route] } });
    },
    async addRoutes(routes: MockedRoutes) {
      return client.add.$post({ json: { scope, routes } });
    },
    async clearScope() {
      return client['clear-scope'].$post({ json: { scope } });
    },
    async reset() {
      return client.reset.$post();
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
