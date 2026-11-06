export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error: {
    code: string;
    message: string;
  };
};

export function apiSuccess<T>(data: T, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json({ data } satisfies ApiSuccess<T>, {
    ...init,
    headers,
  });
}

export function apiFailure(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json(
    { error: { code, message } } satisfies ApiFailure,
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
