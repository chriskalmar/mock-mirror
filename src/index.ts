import { Elysia, t } from 'elysia';
import { logger } from './logger';
import { addDefaultMockedRoutes, addMockedRoutes, clearScope, findMatchingRoute, resetRegistry } from './registry';
import { DEFAULT_SCOPE, MOCK_MIRROR_HEADER } from './const';
import { MockedRoutes } from './schemas';

export const app = new Elysia()

  .get('/', () => "Hello 👋, I'm Mock Mirror")

  .group('/mock-mirror', (mockMirror) => {
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
      );

    return mockMirror;
  })

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
