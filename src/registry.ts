import { DEFAULT_SCOPE } from './const';
import { logger } from './logger';

type MockedRoute = {
  pathPattern: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE' | 'ALL';
  response: unknown;
  status: number;
  headers?: Record<string, string>;
  contentType?: string;
  delay?: number;
};

type MockedRoutes = MockedRoute[];

const registry = new Map<string, MockedRoutes>();

registry.set(DEFAULT_SCOPE, []);

export const resetRegistry = () => {
  registry.clear();
  registry.set(DEFAULT_SCOPE, []);
};

export const addMockedRoute = ({ scope, route }: { scope: string; route: MockedRoute }) => {
  const routes = registry.get(scope) || [];

  registry.set(scope, [route, ...routes]);

  logger.info(`Added new route to scope ${scope}: ${route.method} ${route.pathPattern}`);
};

export const addMockedRoutes = ({ scope, routes }: { scope: string; routes: MockedRoute[] }) => {
  routes.forEach((route) => addMockedRoute({ scope, route }));
};

export const addDefaultMockedRoutes = (routes: MockedRoute[]) => {
  addMockedRoutes({ scope: DEFAULT_SCOPE, routes });
};

const findMatch = ({
  scope,
  path,
  method,
}: {
  scope: string;
  path: string;
  method: string;
}):
  | {
      route: MockedRoute;
      matchType: 'exact' | 'pattern';
    }
  | undefined => {
  const routes = registry.get(scope) ?? [];

  const exactMatchingRoute = routes.find((route) => route.pathPattern === path && route.method === method);

  if (exactMatchingRoute) {
    logger.info(
      `Found matching route in scope ${scope} for: ${method} ${path} [exact: ${exactMatchingRoute.pathPattern}]`,
    );

    return {
      route: exactMatchingRoute,
      matchType: 'exact',
    };
  }

  const exactMatchingFallbackRoute = routes.find((route) => route.pathPattern === path && route.method === 'ALL');

  if (exactMatchingFallbackRoute) {
    logger.info(
      `Found fallback route in scope ${scope} for: ALL ${path} [exact: ${exactMatchingFallbackRoute.pathPattern}]`,
    );

    return {
      route: exactMatchingFallbackRoute,
      matchType: 'exact',
    };
  }

  const matchingRoute = routes.find((route) => new RegExp(route.pathPattern).test(path) && route.method === method);

  if (matchingRoute) {
    logger.info(
      `Found matching route in scope ${scope} for: ${method} ${path} [pattern: ${matchingRoute.pathPattern}]`,
    );

    return {
      route: matchingRoute,
      matchType: 'pattern',
    };
  }

  if (method !== 'ALL') {
    const fallbackRoute = routes.find((route) => new RegExp(route.pathPattern).test(path) && route.method === 'ALL');

    if (fallbackRoute) {
      logger.info(`Found fallback route in scope ${scope} for: ALL ${path} [pattern: ${fallbackRoute.pathPattern}]`);

      return {
        route: fallbackRoute,
        matchType: 'pattern',
      };
    }
  }

  logger.warn(`No matching route found in scope ${scope} for: ${method} ${path}`);
};

export const findMatchingRoute = ({ scope, path, method }: { scope: string; path: string; method: string }) => {
  if (registry.has(scope)) {
    return findMatch({ scope, path, method });
  }

  logger.warn(`Scope ${scope} not found. Falling back to default scope: ${DEFAULT_SCOPE}`);

  return findMatch({ scope: DEFAULT_SCOPE, path, method });
};
