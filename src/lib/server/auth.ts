// src/lib/server/auth.ts
// Clerk has no Expo API-route integration, so the route verifies the session token itself.
// The app sends `Authorization: Bearer <token>` from `useAuth().getToken()`.
import { verifyToken } from "@clerk/backend";

import { HttpError } from "./http-error";

/** The signed-in user's id, or HttpError(401). */
export async function requireSession(request: Request): Promise<string> {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "");
  if (!match) throw new HttpError(401, "unauthorized");

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new HttpError(500, "server_config");

  try {
    // The exported `verifyToken` returns the token's claims and THROWS when it is invalid. (Clerk's internal
    // variant returns { data, errors }; both shapes are handled so a Clerk update cannot turn every session into a 401.)
    const result: unknown = await verifyToken(match[1], { secretKey });
    const wrapped = result !== null && typeof result === "object" && ("data" in result || "errors" in result);
    const errors = wrapped ? (result as { errors?: unknown }).errors : undefined;
    const claims = (wrapped ? (result as { data?: unknown }).data : result) as { sub?: unknown } | undefined;
    if (errors || typeof claims?.sub !== "string" || !claims.sub) throw new HttpError(401, "unauthorized");
    return claims.sub;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(401, "unauthorized");
  }
}
