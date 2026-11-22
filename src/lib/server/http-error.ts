// src/lib/server/http-error.ts
/** An error the route turns into a status and a short code. The message never carries the guest's sentence. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = "HttpError";
  }
}
