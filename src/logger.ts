import pino from 'pino';

export const logger = pino({
  enabled: Bun.env.NODE_ENV !== 'test',
  transport: {
    target: 'pino-pretty',
  },
});
