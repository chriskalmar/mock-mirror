import { Elysia } from 'elysia';
import { logger } from './logger';
import { findMatchingRoute } from './registry';
import { DEFAULT_SCOPE, MOCK_MIRROR_HEADER } from './const';

const app = new Elysia()

  .get('/', () => "Hello 👋, I'm Mock Mirror")

  .all('*', ({ path, headers, set, request }) => {
    const scope = headers[MOCK_MIRROR_HEADER] ?? DEFAULT_SCOPE;

    if (!scope) {
      logger.warn(`No Mock Mirror scope header provided for: ${path}`);
    }

    const route = findMatchingRoute({ scope, path, method: request.method });

    if (route) {
      set.status = route.route.status;
      set.headers = route.route.headers ?? {};

      return route.route.response;
    }

    set.status = 'Not Found';
  })

  .listen(Bun.env.PORT || 3210);

logger.info(`🪞 Mock Mirror is running at ${app.server?.hostname}:${app.server?.port}`);
