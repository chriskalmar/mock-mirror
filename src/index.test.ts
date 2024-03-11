import { beforeEach, describe, expect, it } from 'bun:test';
import { testClient } from 'hono/testing';
import { MOCK_MIRROR_HEADER } from './const';
import server, { app } from '.';

const serverUrl = 'http://localhost:3212';

Bun.serve({
  ...server,
  port: 3212,
});
describe('server', () => {
  beforeEach(async () => {
    await testClient(app)['mock-mirror'].reset.$post();
  });

  it('should return error if missing input for adding routes', async () => {
    const response = await testClient(app)['mock-mirror'].add.$post({
      // @ts-expect-error input is omitted deliberately
      json: {},
    });

    expect(await response.text()).toInclude('ZodError');
  });

  it('should add routes to scope if provided', async () => {
    const response = await testClient(app)['mock-mirror'].add.$post({ json: { scope: 'scope-one', routes: [] } });

    expect(await response.json()).toMatchSnapshot();
  });

  it('should be able to respond with mock', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          scope: 'scope-one',
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'GET',
              response: 'any user',
              status: 200,
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    {
      const response = await fetch(`${serverUrl}/api/users/777`, {
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      });

      expect(await response.text()).toMatchSnapshot('mock response');
    }
  });

  it('should be able to clear scope', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          scope: 'scope-one',
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'GET',
              response: 'any user',
              status: 200,
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    {
      const response = await fetch(`${serverUrl}/api/users/777`, {
        method: 'GET',
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      });

      expect(await response.text()).toMatchSnapshot('mock response');
    }

    {
      const response = await testClient(app)['mock-mirror']['clear-scope'].$post({ json: { scope: 'scope-one' } });

      expect(await response.json()).toMatchSnapshot('clear scope');
    }

    {
      const response = await fetch(`${serverUrl}/api/users/777`, {
        method: 'GET',
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      });

      expect(response.status).toBe(404);
    }
  });

  it('should respond with defined status code and headers', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          scope: 'scope-one',
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'POST',
              response: 'user will be created',
              status: 201,
              headers: {
                'x-custom-header': 'custom-header-value',
              },
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    {
      const response = await fetch(`${serverUrl}/api/users/777`, {
        method: 'POST',
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('x-custom-header')).toBe('custom-header-value');
      expect(await response.text()).toMatchSnapshot('mock response');
    }
  });

  it('should respond with defined content type', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          scope: 'scope-one',
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'POST',
              response: 'user will be created',
              status: 201,
              contentType: 'application/json',
              headers: {
                'x-custom-header': 'custom-header-value',
              },
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    {
      const response = await fetch(`${serverUrl}/api/users/777`, {
        method: 'POST',
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      });

      expect(response.headers.get('content-type')).toMatch('application/json');
      expect(response.headers.get('x-custom-header')).toMatch('custom-header-value');
    }
  });

  it('should respond with defined delay', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          scope: 'scope-one',
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'POST',
              response: {
                message: 'user will be created',
              },
              status: 201,
              contentType: 'application/json',
              delay: 2000,
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    const start = Date.now();
    const response = await fetch(`${serverUrl}/api/users/777`, {
      method: 'POST',
      headers: {
        [MOCK_MIRROR_HEADER]: 'scope-one',
      },
    });

    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(1000);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchSnapshot('mock response');
  });

  it('should respond with default scope if no scope is provided', async () => {
    {
      const response = await testClient(app)['mock-mirror'].add.$post({
        json: {
          routes: [
            {
              pathPattern: '/api/users/*',
              method: 'POST',
              response: 'user will be created',
              status: 201,
              contentType: 'application/json',
            },
          ],
        },
      });

      expect(await response.json()).toMatchSnapshot('add mock route');
    }

    const response = await fetch(`${serverUrl}/api/users/777`, {
      method: 'POST',
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchSnapshot('mock response');
  });
});
