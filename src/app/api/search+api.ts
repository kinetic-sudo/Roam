// src/app/api/search+api.ts
// POST /api/search  { q, sort } | { intent, sort }  ->  { intent, total, stays }
// Checks the Clerk session, reads the sentence (Jev, or the parser as a fallback), builds GROQ in code and runs it
// through the Sanity Context endpoint. A `{ intent }` request (chip toggles, sort changes) skips Jev.
// Errors: 401 no valid session, 400 bad body, 502 Context failed. The guest's sentence is never echoed or logged.
import { imageUrl } from "@/lib/sanity";
import { cleanSentence, type SearchIntent } from "@/lib/search/intent";
import { allowedPlaces } from "@/lib/search/parse";
import type { Stay } from "@/lib/stays";

import { requireSession } from "@/lib/server/auth";
import { contextQuery } from "@/lib/server/context";
import { HttpError } from "@/lib/server/http-error";
import { readIntent } from "@/lib/server/jev";
import { knownPlaces } from "@/lib/server/places";
import { buildSearchGroq } from "@/lib/server/search-groq";
import { searchRequestSchema } from "@/lib/server/search-request";

const CONTEXT_TIMEOUT_MS = 15_000;

export async function POST(request: Request): Promise<Response> {
  try {
    await requireSession(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "bad_request");
    }
    const parsed = searchRequestSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "bad_request");
    const { sort } = parsed.data;

    const places = await knownPlaces();
    const known = allowedPlaces(places);

    let intent: SearchIntent;
    if ("q" in parsed.data) {
      intent = await readIntent(parsed.data.q, places);
    } else {
      // A client intent is untrusted. The schema checked enums, numbers and weights; the place is checked here.
      intent = { ...parsed.data.intent, text: cleanSentence(parsed.data.intent.text) } as SearchIntent;
      if (intent.place && !known.has(intent.place)) throw new HttpError(400, "bad_request");
    }
    // Which reader produced the intent. Never the sentence.
    console.log("search", intent.source);

    const query = buildSearchGroq(intent, sort, known);
    const result = await contextQuery<{ total: number; stays: Stay[] }>(
      query,
      AbortSignal.timeout(CONTEXT_TIMEOUT_MS),
    );

    const stays = (result?.stays ?? []).map((s) => ({
      ...s,
      photos: (s.photos ?? []).map((p) =>
        p?.asset?.url ? { ...p, asset: { ...p.asset, url: imageUrl(p.asset.url, 600) } } : p,
      ),
    }));
    return Response.json({ intent, total: result?.total ?? 0, stays });
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.code }, { status: e.status });
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
