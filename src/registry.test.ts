import { beforeEach, describe, expect, it } from 'bun:test';
import { addDefaultMockedRoutes, addMockedRoutes, findMatchingRoute, resetRegistry } from './registry';

describe('registry', () => {
  beforeEach(() => {
    resetRegistry();
  });

  it('should find a route via exact matching', async () => {
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

    {
      const route = findMatchingRoute({ scope, path: '/', method: 'GET' });
      expect(route).toMatchSnapshot('/');
    }

    {
      const route = findMatchingRoute({ scope, path: '/lorem/ipsum', method: 'POST' });
      expect(route).toMatchSnapshot('/lorem/ipsum');
    }
  });

  it('should fall back to default scope', async () => {
    addDefaultMockedRoutes([
      {
        pathPattern: '/fallback',
        method: 'GET',
        response: 'fallback',
        status: 200,
      },
    ]);

    const route = findMatchingRoute({ scope: 'does-not-exist', path: '/fallback', method: 'GET' });
    expect(route).toMatchSnapshot('/fallback');
  });

  it('should fall back to ALL method', async () => {
    const scope = 'ff71ae5d-3112-4321-a9e1-459f72a453c0';

    addMockedRoutes({
      scope,
      routes: [
        {
          pathPattern: '/',
          method: 'ALL',
          response: 'hi',
          status: 200,
        },
      ],
    });

    const route = findMatchingRoute({ scope, path: '/', method: 'GET' });
    expect(route).toMatchSnapshot('/');
  });
});
