import { type MockedRoute } from './types';

export const withDefaultContentType =
  (defaultContentType?: string) =>
  (route: MockedRoute): MockedRoute => {
    if (defaultContentType) {
      return {
        ...route,
        contentType: route.contentType ?? defaultContentType,
      };
    }

    return route;
  };
