// src/lib/sanity-cdn.ts
// Reads Sanity through the public API CDN: no token, no SDK. Needs the dataset to be public (the default).
// If your app already has a `sanityQuery` and `imageUrl`, delete this file and point the imports at yours.

const PROJECT_ID = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID ?? "jt059w5f";
const DATASET = process.env.EXPO_PUBLIC_SANITY_DATASET ?? "production";
const API_VERSION = "2026-10-08";

export async function sanityQuery<T>(
  query: string,
  params: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  // Built by hand: React Native's URLSearchParams is incomplete on some versions.
  let qs = `query=${encodeURIComponent(query)}`;
  for (const [k, v] of Object.entries(params))
    qs += `&${encodeURIComponent(`$${k}`)}=${encodeURIComponent(JSON.stringify(v))}`;
  const res = await fetch(
    `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?${qs}`,
    { signal },
  );
  if (!res.ok) throw new Error(`Sanity query failed (${res.status})`);
  const body = (await res.json()) as { result: T };
  return body.result;
}

/** A resized, auto-format version of a Sanity image URL. */
export const imageUrl = (url: string, width: number) =>
  `${url}?w=${width}&auto=format&fit=max`;
