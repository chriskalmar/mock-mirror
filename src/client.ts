import { edenTreaty } from '@elysiajs/eden';
import { app } from '.';
import { randomUUID } from 'crypto';
import { MOCK_MIRROR_HEADER } from './const';

export const createMockMirror = async ({ mockMirrorUrl }: { mockMirrorUrl?: string }) => {
  const api = edenTreaty<typeof app>(mockMirrorUrl ?? Bun.env.MOCK_MIRROR_URL ?? 'http://localhost:3210');

  const getTools = ({ scope = randomUUID() }: { scope: string }) => ({
    addRoute: async (route: MockedRoute) => {
      return await api['mock-mirror'].add.post({ scope, routes: [route] });
    },
    clearScope: async () => {
      return await api['mock-mirror'].reset.post({ scope });
    },
  });

  return (
    integrationTest: (params: typeof tools) => unknown,
    options?: {
      scope?: string;
    },
  ) => {
    const scope = options?.scope ?? randomUUID();

    return integrationTest(tools);
  };
};

const mockMirror = await createMockMirror({});

it('should be able to clear scope', async () => {
  await mockMirror(async ({ addRoute }) => {
    await addRoute({
      pathPattern: '/api/users/*',
      method: 'GET',
      response: 'any',
    });
  });
});
