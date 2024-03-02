import { beforeEach, describe, expect, it } from 'bun:test';
import { addDefaultMockedRoutes, addMockedRoutes, findMatchingRoute, resetRegistry } from './registry';

const scope = 'ff71ae5d-3112-4321-a9e1-459f72a453c0';

describe('registry', () => {
  beforeEach(() => {
    resetRegistry();
  });

  it('should find a route via exact matching', async () => {
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
    addMockedRoutes({
      scope,
      routes: [
        {
          pathPattern: '/catch-all',
          method: 'ALL',
          response: 'I got you covered!',
          status: 200,
        },
      ],
    });

    const route = findMatchingRoute({ scope, path: '/catch-all', method: 'GET' });
    expect(route).toMatchSnapshot('/catch-all');
  });

  it('should fall back to ALL method of default scope', async () => {
    addDefaultMockedRoutes([
      {
        pathPattern: '/catch-all',
        method: 'ALL',
        response: 'I got you covered!',
        status: 200,
      },
    ]);

    const route = findMatchingRoute({ scope: 'does-not-exist', path: '/catch-all', method: 'GET' });
    expect(route).toMatchSnapshot('/catch-all');
  });

  it('should find a route via pattern matching', async () => {
    addMockedRoutes({
      scope,
      routes: [
        {
          pathPattern: '/users/*',
          method: 'GET',
          response: 'any user',
          status: 200,
        },
        {
          pathPattern: '/users/12345',
          method: 'GET',
          response: 'user 12345',
          status: 200,
        },
        {
          pathPattern: '/api/**',
          method: 'GET',
          response: 'any api endpoint',
          status: 200,
        },
        {
          pathPattern: '/api/v1/**',
          method: 'GET',
          response: 'any v1 api endpoint',
          status: 200,
        },
        {
          pathPattern: '/api/v1/users/*',
          method: 'GET',
          response: 'any v1 user',
          status: 200,
        },
      ],
    });

    {
      const route = findMatchingRoute({ scope, path: '/users', method: 'GET' });
      expect(route).toBeUndefined();
    }

    {
      const route = findMatchingRoute({ scope, path: '/users/', method: 'GET' });
      expect(route).toBeUndefined();
    }

    {
      const route = findMatchingRoute({ scope, path: '/users/777', method: 'GET' });
      expect(route).toMatchSnapshot('/users/777');
    }

    {
      const route = findMatchingRoute({ scope, path: '/users/12345', method: 'GET' });
      expect(route).toMatchSnapshot('/users/12345');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api', method: 'GET' });
      expect(route).toBeUndefined();
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/', method: 'GET' });
      expect(route).toMatchSnapshot('/api/');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/lorem', method: 'GET' });
      expect(route).toMatchSnapshot('/api/lorem');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/v1', method: 'GET' });
      expect(route).toMatchSnapshot('/api/v1');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/v1/', method: 'GET' });
      expect(route).toMatchSnapshot('/api/v1/');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/v1/users', method: 'GET' });
      expect(route).toMatchSnapshot('/api/v1/users');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/v1/users/', method: 'GET' });
      expect(route).toMatchSnapshot('/api/v1/users/');
    }

    {
      const route = findMatchingRoute({ scope, path: '/api/v1/users/777', method: 'GET' });
      expect(route).toMatchSnapshot('/api/v1/users/777');
    }
  });

  it('should find a route via pattern matching with ALL method', async () => {
    addMockedRoutes({
      scope,
      routes: [
        {
          pathPattern: '/api/**',
          method: 'ALL',
          response: 'any api endpoint',
          status: 200,
        },
      ],
    });

    const route = findMatchingRoute({ scope, path: '/api/v1/users/777', method: 'POST' });
    expect(route).toMatchSnapshot('/api/v1/users/777');
  });

  it('should find a route via pattern matching with ALL method of default scope', async () => {
    addDefaultMockedRoutes([
      {
        pathPattern: '/api/**',
        method: 'ALL',
        response: 'any api endpoint',
        status: 200,
      },
    ]);

    const route = findMatchingRoute({ scope: 'does-not-exist', path: '/api/v1/users/777', method: 'POST' });
    expect(route).toMatchSnapshot('/api/v1/users/777');
  });

  it('should respect the order of routes', async () => {
    {
      resetRegistry();

      addMockedRoutes({
        scope,
        routes: [
          {
            pathPattern: '/api/users/*',
            method: 'GET',
            response: 'any user',
            status: 200,
          },
          {
            pathPattern: '/api/*',
            method: 'GET',
            response: 'any api endpoint',
            status: 200,
          },
        ],
      });

      const route = findMatchingRoute({ scope, path: '/api/users/777', method: 'GET' });
      expect(route).toMatchSnapshot('simple patterns');
    }

    {
      resetRegistry();

      addMockedRoutes({
        scope,
        routes: [
          {
            pathPattern: '/api/users/**',
            method: 'GET',
            response: 'any user',
            status: 200,
          },
          {
            pathPattern: '/api/**',
            method: 'GET',
            response: 'any api endpoint',
            status: 200,
          },
        ],
      });

      const route = findMatchingRoute({ scope, path: '/api/users/777', method: 'GET' });
      expect(route).toMatchSnapshot('wider patterns');
    }

    {
      resetRegistry();

      addMockedRoutes({
        scope,
        routes: [
          {
            pathPattern: '/api/**',
            method: 'GET',
            response: 'any api endpoint',
            status: 200,
          },
          {
            pathPattern: '/api/users/**',
            method: 'GET',
            response: 'any user',
            status: 200,
          },
        ],
      });

      const route = findMatchingRoute({ scope, path: '/api/users/777', method: 'GET' });
      expect(route).toMatchSnapshot('last pattern wins');
    }
  });
});
