import { Hono } from 'hono';
import { type StatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
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
import { MockedRoutesDto } from './schemas';

const mockMirrorRoutes = new Hono()
  .post('/reset', (ctx) => {
    resetRegistry();

    logger.info('Registry has been reset');

    return ctx.json({
      success: true,
    });
  })
  .post(
    '/add',
    zValidator(
      'json',
      z.object({
        scope: z.string().optional(),
        routes: MockedRoutesDto,
      }),
    ),
    (ctx) => {
      const body = ctx.req.valid('json');

      if (body.scope) {
        addMockedRoutes({
          scope: body.scope,
          routes: body.routes,
        });
      } else {
        addDefaultMockedRoutes(body.routes);
      }

      return ctx.json({
        success: true,
      });
    },
  )
  .post(
    '/clear-scope',
    zValidator(
      'json',
      z.object({
        scope: z.string(),
      }),
    ),
    (ctx) => {
      const body = ctx.req.valid('json');

      clearScope(body.scope);

      logger.info(`Cleared scope: ${body.scope}`);

      return ctx.json({
        success: true,
      });
    },
  )
  .get('/stats', (ctx) => ctx.json(stats()));

const app = new Hono()
  .get('/', (ctx) => ctx.text("Hello 👋, I'm Mock Mirror"))
  .route('/mock-mirror', mockMirrorRoutes)
  .all('*', async (ctx) => {
    const scope = ctx.req.header(MOCK_MIRROR_HEADER) ?? DEFAULT_SCOPE;
    const { path, method } = ctx.req;

    if (!scope) {
      logger.warn(`No Mock Mirror scope header provided for: ${path}`);
    }

    const found = findMatchingRoute({ scope, path, method });

    if (found) {
      const headers = found.route.headers ?? {};
      if (found.route.contentType) {
        headers['content-type'] = found.route.contentType;
      }

      if (found.route.delay) {
        await new Promise((resolve) => {
          setTimeout(resolve, found.route.delay);
        });
      }

      ctx.status((found.route.status ?? 200) as StatusCode);

      for (const [key, value] of Object.entries(headers)) {
        ctx.header(key, value);
      }

      ctx.body('found.route.response');
    }

    ctx.status(404);
    ctx.body('Not Found');
  });

logger.info(`🪞 Mock Mirror is running at http://localhost:${Bun.env.PORT ?? 3210}`);

export default {
  port: Bun.env.PORT ?? 3210,
  fetch: app.fetch,
};

export type App = typeof app;
