import { Elysia } from 'elysia';
import { logger } from './logger';

const app = new Elysia()

  .get('/', () => "Hello 👋, I'm Mock Mirror")

  .all('*', ({ path, headers, set }) => {
    console.log(path, headers);

    set.status = 'Not Found';
  })

  .listen(Bun.env.PORT || 3210);

logger.info(`🪞 Mock Mirror is running at ${app.server?.hostname}:${app.server?.port}`);
