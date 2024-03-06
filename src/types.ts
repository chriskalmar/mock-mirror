import { type Static } from 'elysia';
import { type MockedRouteDto, type MockedRoutesDto } from './schemas';

export type MockedRoute = Static<typeof MockedRouteDto>;
export type MockedRoutes = Static<typeof MockedRoutesDto>;
