import { describe, expect, it } from 'bun:test';
import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';

const mockMirrorPath = 'http://localhost/mock-mirror';
const defaultPath = 'http://localhost/';

describe('server', () => {
  it('should return error if missing input for adding routes', async () => {
    const addRoutes = await app
      .handle(
        new Request(`${mockMirrorPath}/add`, {
          method: 'POST',
        }),
      )
      .then((res) => res.text());

    expect(addRoutes).toInclude('Expected object');
  });

  it('should add routes to scope if provided', async () => {
    const addRoutes = await app
      .handle(
        new Request(`${mockMirrorPath}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scope: 'ff71ae5d-3112-4321-a9e1-459f72a453c0',
            routes: [],
          }),
        }),
      )
      .then((res) => res.json());

    expect(addRoutes).toMatchSnapshot();
  });
});
