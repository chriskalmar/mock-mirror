import { beforeEach, describe, expect, it } from 'bun:test';
import { addDefaultMockedRoutes, addMockedRoutes, findMatchingRoute, resetRegistry } from './registry';

describe('registry', () => {
  beforeEach(() => {
    resetRegistry();
  });

  it('should match a regular path', async () => {
    const scope = 'ff71ae5d-3112-4321-a9e1-459f72a453c0';

    addMockedRoutes({
      scope,
      routes: [
        {
          pathPattern: '/',
          method: 'GET',
          response: 'hi',
          status: 200,
        },
        {
          pathPattern: '/lorem/ipsum',
          method: 'POST',
          response: 'dolor sit amet',
          status: 201,
        },
      ],
    });

    const route = findMatchingRoute({ scope, path: '/', method: 'GET' });

    expect(route).toMatchSnapshot('/');
    expect(route).toMatchSnapshot('/lorem/ipsum');
  });
});
