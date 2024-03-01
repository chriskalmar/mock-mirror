import { DEFAULT_SCOPE } from './const';
import { logger } from './logger';

type MockedRoute = {
  pathPattern: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE' | 'ALL';
  response: unknown;
  status: number;
  headers: Record<string, string>;
  contentType: string;
  delay: number;
};

type MockedRoutes = MockedRoute[];

const registry = new Map<string, MockedRoutes>();

registry.set(DEFAULT_SCOPE, []);

export const addMockedRoute = ({ scope, route }: { scope: string; route: MockedRoute }) => {
  const routes = registry.get(scope) || [];

  registry.set(scope, [route, ...routes]);

  logger.info(`Added new route to scope ${scope}: ${route.method} ${route.pathPattern}`);
};

export const addMockedRoutes = ({ scope, routes }: { scope: string; routes: MockedRoute[] }) => {
  routes.forEach((route) => addMockedRoute({ scope, route }));
};

export const findMatchingRoute = ({ scope, path, method }: { scope: string; path: string; method: string }) => {
  if (!registry.has(scope)) {
    logger.warn(`Scope ${scope} not found. Falling back to default scope: ${DEFAULT_SCOPE}`);
  }

  const routes = registry.get(scope) ?? registry.get(DEFAULT_SCOPE) ?? [];

  const matchingRoute = routes.find((route) => new RegExp(route.pathPattern).test(path) && route.method === method);

  if (matchingRoute) {
    logger.info(`Found matching route in scope ${scope} for: ${method} ${path}`);

    return matchingRoute;
  }

  logger.warn(`No matching route found in scope ${scope} for: ${method} ${path}`);

  if (method !== 'ALL') {
    const fallbackRoute = routes.find((route) => new RegExp(route.pathPattern).test(path) && route.method === 'ALL');

    if (fallbackRoute) {
      logger.info(`Found fallback route in scope ${scope} for: ALL ${path}`);

      return fallbackRoute;
    }
  }
};
