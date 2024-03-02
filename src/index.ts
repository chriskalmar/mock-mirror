import { Elysia, t } from 'elysia';
import { logger } from './logger';
import {
  addDefaultMockedRoutes,
  addMockedRoutes,
  clearScope,
  findMatchingRoute,
  resetRegistry,
  stats,
} from './registry';
import { DEFAULT_SCOPE, MOCK_MIRROR_HEADER } from './const';
import { MockedRoutes } from './schemas';

export const app = new Elysia()

  .get('/', () => "Hello 👋, I'm Mock Mirror")

  .group('/mock-mirror', (mockMirror) =>
    mockMirror
      .post('/reset', () => {
        resetRegistry();

        logger.info('Registry has been reset');

        return {
          success: true,
        };
      })

      .post(
        '/add',
        ({ body }) => {
          if (body.scope) {
            addMockedRoutes({
              scope: body.scope,
              routes: body.routes,
            });
          } else {
            addDefaultMockedRoutes(body.routes);
          }

          return {
            success: true,
          };
        },
        {
          body: t.Object({
            scope: t.Optional(t.String()),
            routes: MockedRoutes,
          }),
        },
      )

      .post(
        '/clear-scope',
        ({ body }) => {
          clearScope(body.scope);

          logger.info(`Cleared scope: ${body.scope}`);

          return {
            success: true,
          };
        },
        {
          body: t.Object({
            scope: t.String(),
          }),
        },
      )

      .get('/stats', stats),
  )

  .all('*', async ({ path, headers, set, request }) => {
    const scope = headers[MOCK_MIRROR_HEADER] ?? DEFAULT_SCOPE;

    if (!scope) {
      logger.warn(`No Mock Mirror scope header provided for: ${path}`);
    }

    const found = findMatchingRoute({ scope, path, method: request.method });

    if (found) {
      const headers = found.route.headers ?? {};
      if (found.route.contentType) {
        headers['content-type'] = found.route.contentType;
      }

      if (found.route.delay) {
        await new Promise((resolve) => setTimeout(resolve, found.route.delay));
      }

      set.status = found.route.status;
      set.headers = headers;

      return found.route.response;
    }

    set.status = 'Not Found';
    return 'Not Found';
  })

  .listen(Bun.env.PORT || 3210);

logger.info(`🪞 Mock Mirror is running at ${app.server?.hostname}:${app.server?.port}`);
