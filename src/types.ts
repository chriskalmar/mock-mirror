import type { z } from 'zod';
import { type MockedRouteDto, type MockedRoutesDto } from './schemas';

export type MockedRoute = z.infer<typeof MockedRouteDto>;
export type MockedRoutes = z.infer<typeof MockedRoutesDto>;
