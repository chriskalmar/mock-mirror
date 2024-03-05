import { Static } from 'elysia';
import { DEFAULT_SCOPE } from './const';
import { logger } from './logger';
import { minimatch } from 'minimatch';
import { MockedRoute, MockedRoutes } from './types';

const registry = new Map<string, MockedRoutes>();

registry.set(DEFAULT_SCOPE, []);

export const resetRegistry = () => {
  registry.clear();
  registry.set(DEFAULT_SCOPE, []);
};

export const clearScope = (scope: string) => {
  registry.delete(scope);
};

export const stats = () => ({
  scopes: registry.size,
  routes: Array.from(registry.values()).reduce((acc, routes) => acc + routes.length, 0),
});

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
      scope: string;
      pathPattern: string;
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
      scope,
      pathPattern: exactMatchingRoute.pathPattern,
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
      scope,
      pathPattern: exactMatchingFallbackRoute.pathPattern,
    };
  }

  const matchingRoute = routes.find((route) => minimatch(path, route.pathPattern) && route.method === method);

  if (matchingRoute) {
    logger.info(
      `Found matching route in scope ${scope} for: ${method} ${path} [pattern: ${matchingRoute.pathPattern}]`,
    );

    return {
      route: matchingRoute,
      matchType: 'pattern',
      scope,
      pathPattern: matchingRoute.pathPattern,
    };
  }

  if (method !== 'ALL') {
    const fallbackRoute = routes.find((route) => minimatch(path, route.pathPattern) && route.method === 'ALL');

    if (fallbackRoute) {
      logger.info(`Found fallback route in scope ${scope} for: ALL ${path} [pattern: ${fallbackRoute.pathPattern}]`);

      return {
        route: fallbackRoute,
        matchType: 'pattern',
        scope,
        pathPattern: fallbackRoute.pathPattern,
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
