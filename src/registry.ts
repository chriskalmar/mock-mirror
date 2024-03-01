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
