type MockedRoute = {
  path: string;
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
  delay: number;
  contentType: string;
};

type MockedRoutes = Map<string, MockedRoute>;

const registry = new Map<string, MockedRoutes>();
