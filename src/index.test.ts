import { describe, expect, it } from 'bun:test';
import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';

const api = edenTreaty<typeof app>(`http://localhost:${app.server?.port}`);

describe('server', () => {
  it('should return error if missing input for adding routes', async () => {
    // @ts-expect-error input is omitted deliberately
    const { data, error, status, response } = await api['mock-mirror'].add.post();

    expect(status).toBe(400);
    expect(data).toInclude('Expected object');
  });

  it('should add routes to scope if provided', async () => {
    const { data } = await api['mock-mirror'].add.post({ scope: 'scope-one', routes: [] });

    expect(data).toMatchSnapshot();
  });
});
