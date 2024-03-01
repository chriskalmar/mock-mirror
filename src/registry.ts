import { DEFAULT_SCOPE } from "./const";

type MockedRoute = {
  pathPattern: string;
  method:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS"
    | "HEAD"
    | "CONNECT"
    | "TRACE"
    | "ALL";
  response: unknown;
  status: number;
  headers: Record<string, string>;
  contentType: string;
  delay: number;
};

type MockedRoutes = MockedRoute[];

const registry = new Map<string, MockedRoutes>();

registry.set(DEFAULT_SCOPE, []);
