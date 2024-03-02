import { beforeEach, describe, expect, it } from 'bun:test';
import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';
import { MOCK_MIRROR_HEADER } from './const';

const serverUrl = `http://localhost:${app.server?.port}`;
const api = edenTreaty<typeof app>(serverUrl);

describe('server', () => {
  beforeEach(async () => {
    await api['mock-mirror'].reset.post();
  });

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

  it('should be able to respond with mock', async () => {
    {
      const { data } = await api['mock-mirror'].add.post({
        scope: 'scope-one',
        routes: [
          {
            pathPattern: '/api/users/*',
            method: 'GET',
            response: 'any user',
            status: 200,
          },
        ],
      });

      expect(data).toMatchSnapshot('add mock route');
    }

    {
      const response = await app
        .handle(
          new Request(`${serverUrl}/api/users/777`, {
            method: 'GET',
            headers: {
              [MOCK_MIRROR_HEADER]: 'scope-one',
            },
          }),
        )
        .then((res) => res.text());

      expect(response).toMatchSnapshot('mock response');
    }
  });

  it('should be able to clear scope', async () => {
    {
      const { data } = await api['mock-mirror'].add.post({
        scope: 'scope-one',
        routes: [
          {
            pathPattern: '/api/users/*',
            method: 'GET',
            response: 'any user',
            status: 200,
          },
        ],
      });

      expect(data).toMatchSnapshot('add mock route');
    }

    {
      const response = await app
        .handle(
          new Request(`${serverUrl}/api/users/777`, {
            method: 'GET',
            headers: {
              [MOCK_MIRROR_HEADER]: 'scope-one',
            },
          }),
        )
        .then((res) => res.text());

      expect(response).toMatchSnapshot('mock response');
    }

    {
      const { data } = await api['mock-mirror']['clear-scope'].post({ scope: 'scope-one' });

      expect(data).toMatchSnapshot('clear scope');
    }

    {
      const response = await app.handle(
        new Request(`${serverUrl}/api/users/777`, {
          method: 'GET',
          headers: {
            [MOCK_MIRROR_HEADER]: 'scope-one',
          },
        }),
      );

      expect(response.status).toBe(404);
    }
  });

  it('should respond with defined status code and headers', async () => {
    {
      const { data } = await api['mock-mirror'].add.post({
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
      });

      expect(data).toMatchSnapshot('add mock route');
    }

    {
      const response = await app.handle(
        new Request(`${serverUrl}/api/users/777`, {
          method: 'POST',
          headers: {
            [MOCK_MIRROR_HEADER]: 'scope-one',
          },
        }),
      );

      expect(response.status).toBe(201);
      expect(response.headers.get('x-custom-header')).toBe('custom-header-value');
      expect(await response.text()).toMatchSnapshot('mock response');
    }
  });

  it('should respond with defined content type', async () => {
    {
      const { data } = await api['mock-mirror'].add.post({
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
      });

      expect(data).toMatchSnapshot('add mock route');
    }

    {
      const response = await app.handle(
        new Request(`${serverUrl}/api/users/777`, {
          method: 'POST',
          headers: {
            [MOCK_MIRROR_HEADER]: 'scope-one',
          },
        }),
      );

      expect(response.headers.toJSON()).toMatchSnapshot('headers');
    }
  });

  it('should respond with defined delay', async () => {
    {
      const { data } = await api['mock-mirror'].add.post({
        scope: 'scope-one',
        routes: [
          {
            pathPattern: '/api/users/*',
            method: 'POST',
            response: 'user will be created',
            status: 201,
            contentType: 'application/json',
            delay: 2000,
          },
        ],
      });

      expect(data).toMatchSnapshot('add mock route');
    }

    const start = Date.now();
    const response = await app.handle(
      new Request(`${serverUrl}/api/users/777`, {
        method: 'POST',
        headers: {
          [MOCK_MIRROR_HEADER]: 'scope-one',
        },
      }),
    );
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(1000);
    expect(response.status).toBe(201);
    expect(await response.text()).toMatchSnapshot('mock response');
  });
});
