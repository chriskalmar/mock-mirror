import { randomUUID } from 'node:crypto';
import type { ClientRequestOptions } from 'hono';
import fetch from 'isomorphic-fetch';
import { hc } from 'hono/client';
import type { MockedRoute, MockedRoutes } from './types';
import { withDefaultContentType } from './utils';
import type { App } from '.';

export type { MockedRoute, MockedRoutes } from './types';

export { MOCK_MIRROR_HEADER } from './const';

export const createMockMirror = ({
  mockMirrorUrl,
  defaultRoutes,
  defaultContentType,
  options,
}: {
  mockMirrorUrl?: string;
  defaultRoutes?: MockedRoutes;
  defaultContentType?: string;
  options?: ClientRequestOptions;
}) => {
  const client = hc<App>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210', {
    ...options,
    fetch: options?.fetch ?? fetch,
  });

  if (defaultRoutes) {
    void client['mock-mirror'].add.$post({
      json: {
        routes: defaultRoutes.map(withDefaultContentType(defaultContentType)),
      },
    });
  }

  const getTools = ({ scope }: { scope: string }) => ({
    async addRoute(route: MockedRoute) {
      return client['mock-mirror'].add.$post({
        json: { scope, routes: [withDefaultContentType(defaultContentType)(route)] },
      });
    },
    async addRoutes(routes: MockedRoutes) {
      return client['mock-mirror'].add.$post({
        json: { scope, routes: routes.map(withDefaultContentType(defaultContentType)) },
      });
    },
    async clearScope() {
      return client['mock-mirror']['clear-scope'].$post({ json: { scope } });
    },
    async reset() {
      return client['mock-mirror'].reset.$post();
    },
    scope,
  });

  return async (
    integrationTest: (tools: ReturnType<typeof getTools>) => unknown,
    options?: {
      scope?: string;
    },
  ) => {
    const scope = options?.scope ?? randomUUID();

    const testResults = await integrationTest(
      getTools({
        scope,
      }),
    );

    void client['mock-mirror']['clear-scope'].$post({ json: { scope } });

    return testResults;
  };
};
