import { z } from 'zod';

export const MockedRouteDto = z.object({
  pathPattern: z.string().min(1),
  method: z.optional(
    z.union([
      z.literal('GET'),
      z.literal('POST'),
      z.literal('PUT'),
      z.literal('DELETE'),
      z.literal('PATCH'),
      z.literal('OPTIONS'),
      z.literal('HEAD'),
      z.literal('CONNECT'),
      z.literal('TRACE'),
      z.literal('ALL'),
    ]),
  ),
  response: z.unknown(),
  status: z.optional(z.number()),
  headers: z.optional(z.record(z.string(), z.string())),
  contentType: z.optional(z.string()),
  delay: z.optional(z.number()),
});

export const MockedRoutesDto = z.array(MockedRouteDto);
