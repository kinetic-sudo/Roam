// src/lib/sanity.ts
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "jt059w5f",
  dataset: "production",
  apiVersion: "2026-03-01",
  useCdn: true,
});
