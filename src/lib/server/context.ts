// src/lib/server/context.ts
// Runs a GROQ query through the Sanity Context endpoint (`roam-record-search`, GROQ mode): a plain JSON-RPC
// `tools/call` of `groq_query`. Stateless: no `initialize` call. No MCP client library.
// `groq_query` takes no params, so the query already has its literals (see `lit()` in search-groq.ts).
import { HttpError } from "./http-error";

type RpcResponse = {
  error?: unknown;
  result?: { isError?: boolean; content?: { type?: string; text?: string }[] };
};

/** The endpoint answers plain JSON, or one server-sent event: accept both. */
function readRpc(body: string): RpcResponse {
  try {
    return JSON.parse(body) as RpcResponse;
  } catch {
    const data = body
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim())
      .pop();
    if (!data) throw new HttpError(502, "context_failed");
    return JSON.parse(data) as RpcResponse;
  }
}

/**
 * Returns the `result` of the query. 502 when the endpoint answers non-200, with a JSON-RPC error, or with
 * `isError` (a GROQ error). Nothing from the endpoint's message is passed on: it can echo the query.
 */
export async function contextQuery<T>(query: string, signal?: AbortSignal): Promise<T> {
  const url = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_ORGANIZATION_TOKEN;
  if (!url || !token) throw new HttpError(500, "server_config");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "groq_query", arguments: { query } },
      }),
      signal,
    });
  } catch {
    throw new HttpError(502, "context_failed");
  }
  if (!res.ok) throw new HttpError(502, "context_failed");

  try {
    const rpc = readRpc(await res.text());
    if (rpc.error || rpc.result?.isError) throw new HttpError(502, "context_failed");
    const text = rpc.result?.content?.[0]?.text;
    if (typeof text !== "string") throw new HttpError(502, "context_failed");
    return (JSON.parse(text) as { result: T }).result;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(502, "context_failed");
  }
}
