import { t } from 'elysia';

export const MockedRouteDto = t.Object({
  pathPattern: t.String({ minLength: 1 }),
  method: t.Optional(
    t.Union([
      t.Literal('GET'),
      t.Literal('POST'),
      t.Literal('PUT'),
      t.Literal('DELETE'),
      t.Literal('PATCH'),
      t.Literal('OPTIONS'),
      t.Literal('HEAD'),
      t.Literal('CONNECT'),
      t.Literal('TRACE'),
      t.Literal('ALL'),
    ]),
  ),
  response: t.Unknown(),
  status: t.Optional(t.Number()),
  headers: t.Optional(t.Record(t.String(), t.String())),
  contentType: t.Optional(t.String()),
  delay: t.Optional(t.Number()),
});

export const MockedRoutesDto = t.Array(MockedRouteDto);
