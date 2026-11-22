// src/lib/server/run-query.ts
// Where a search query runs. Normally the Sanity Context endpoint (embeddings + ranking). When its URL or token is
// not configured (a fresh checkout, a dev machine without the credentials) the same filtered query runs on the
// public CDN, which already serves Home and the stay pages, without the embeddings step.
import { sanityQuery } from "@/lib/sanity";

import { HttpError } from "./http-error";

export const contextConfigured = (): boolean =>
  !!process.env.SANITY_CONTEXT_MCP_URL && !!process.env.SANITY_ORGANIZATION_TOKEN;

/** The public CDN. Literals are already in the query text (see `lit()`), so there are no params. */
export async function cdnQuery<T>(query: string, signal?: AbortSignal): Promise<T> {
  try {
    return await sanityQuery<T>(query, {}, signal);
  } catch {
    throw new HttpError(502, "context_failed");
  }
}

let warned = false;
/** One line, once: the search is running without embeddings. */
export function warnNoContext() {
  if (warned) return;
  warned = true;
  console.warn("search: SANITY_CONTEXT_MCP_URL / SANITY_ORGANIZATION_TOKEN not set; using the public CDN without embeddings");
}

/** For tests. */
export const resetWarned = () => {
  warned = false;
};
