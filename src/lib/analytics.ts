// src/lib/analytics.ts
// One place for product events. PostHog is not installed in this app yet: when it is, call `setAnalyticsSink`
// once at startup with `(event, props) => posthog?.capture(event, props)`. Until then events only log in dev.
// Failures never reach the caller, so analytics can never block a screen.

type Props = Record<string, string | number | boolean | string[]>;

export type AnalyticsEvent =
  | { name: "stay_viewed"; props: { slug: string; type: string } }
  | { name: "stay_shared"; props: { slug: string } }
  | { name: "stay_policies_opened"; props: { slug: string; from: "ask" | "cancellation" | "ask_answer" | "good_to_know" } }
  | { name: "stay_host_opened"; props: { slug: string } }
  | { name: "stay_book_tapped"; props: { slug: string } }
  | { name: "stay_ask_opened"; props: { slug: string } }
  // Topic keys only: what the guest typed is never sent.
  | {
      name: "stay_ask_sent";
      props: { slug: string; from: "chip" | "typed"; topics: string[]; answered: boolean };
    };

let sink: ((event: string, props: Props) => void) | null = null;

export function setAnalyticsSink(fn: ((event: string, props: Props) => void) | null) {
  sink = fn;
}

export function track(event: AnalyticsEvent) {
  try {
    if (sink) sink(event.name, event.props);
    else if (__DEV__) console.log("[analytics]", event.name, event.props);
  } catch {
    // ignore
  }
}
