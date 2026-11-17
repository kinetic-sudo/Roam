// src/lib/ask.ts
// "Ask about this stay": topics, keyword matching and answer cards. Pure functions, no React, no network.
// Nothing is generated: every card line is a string the stay already has (a house-rule line or a policy summary),
// shown word for word. Until Jev routes questions, topics come from keywords here.
import { houseRuleParts, type HouseRuleKey } from "./stay-details";
import type { PolicyKind, StayDetails, StayPolicy } from "./stays";

export type TopicKey =
  | "cancellation"
  | "checkIn"
  | "pets"
  | "houseRules"
  | "payment"
  | "damage"
  | "guestRefund";

export interface Topic {
  key: TopicKey;
  /** The chip's label. */
  label: string;
  /** What a tap on the chip sends as the guest's message. */
  question: string;
  /** Case-insensitive, matched at the start of a word. */
  keywords: string[];
}

/** In this order: the chips, and the order cards appear in when one question matches several topics. */
export const TOPICS: Topic[] = [
  { key: "cancellation", label: "Cancellation", question: "What's the cancellation policy?", keywords: ["cancel", "refund before"] },
  {
    key: "checkIn",
    label: "Check-in",
    question: "When are check-in and checkout?",
    keywords: ["check in", "check-in", "checkin", "checkout", "check out", "arriv", "leave", "late", "early"],
  },
  { key: "pets", label: "Pets", question: "Can I bring my pet?", keywords: ["pet", "dog", "cat", "animal"] },
  {
    key: "houseRules",
    label: "House rules",
    question: "What are the house rules?",
    keywords: ["rule", "smok", "part", "quiet", "noise", "event"],
  },
  { key: "payment", label: "Payment", question: "How does payment work?", keywords: ["pay", "charge", "price", "cost", "fee", "card"] },
  { key: "damage", label: "Damage", question: "What if something gets damaged?", keywords: ["damage", "deposit", "broke"] },
  {
    key: "guestRefund",
    label: "Refunds",
    question: "What if the stay isn't as described?",
    keywords: ["refund", "as described", "issue", "problem"],
  },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One regex per topic, built once: a keyword counts when it starts a word.
const MATCHERS = TOPICS.map((t) => ({
  key: t.key,
  re: new RegExp(`(?:^|[^a-z0-9])(?:${t.keywords.map(escape).join("|")})`, "i"),
}));

/** The topics a typed question touches, in the table's order. Empty when nothing matches. */
export function matchTopics(text: string): TopicKey[] {
  const q = text.trim();
  if (!q) return [];
  return MATCHERS.filter((m) => m.re.test(q)).map((m) => m.key);
}

export interface AnswerCard {
  /** Unique within one reply. */
  key: string;
  title: string;
  /** One `Text` per line. */
  lines: string[];
  /** Absent only on the "no answer" card. */
  source?: { label: string; icon: "home" | "policy" };
  /** `section` is a policy kind: the Policies sheet scrolls to it. No `section`: the sheet opens at the top. */
  link?: { label: string; section?: string };
}

const HOUSE_SOURCE = { label: "This stay's house rules", icon: "home" } as const;
const ROAM_SOURCE = { label: "Roam policy", icon: "policy" } as const;
const CANCELLATION_SOURCE = { label: "Cancellation policy", icon: "policy" } as const;

export const NO_ANSWER: AnswerCard = {
  key: "none",
  title: "No answer in this stay's details",
  lines: ["Roam's policies and this stay's details don't cover this. Contact Roam support."],
};

/** A card answered something; the "no answer" card is the only one without a source. */
export const isAnswered = (cards: AnswerCard[]) => cards.some((c) => !!c.source);

const filled = (s: string | null | undefined): s is string => !!s && s.trim().length > 0;

/** First policy of these kinds (in this order) that has a summary to show. */
function policyOf(stay: StayDetails, kinds: PolicyKind[]): StayPolicy | undefined {
  for (const kind of kinds) {
    const found = stay.policies.find((p) => p.kind === kind && filled(p.summary));
    if (found) return found;
  }
  return undefined;
}

function policyCard(topic: TopicKey, policy: StayPolicy | null | undefined, source: AnswerCard["source"]): AnswerCard[] {
  if (!policy || !filled(policy.summary)) return [];
  return [
    {
      key: `${topic}:${policy.kind}`,
      title: policy.title,
      lines: [policy.summary],
      source,
      link: { label: "Read full policy", section: policy.kind },
    },
  ];
}

function houseCard(
  topic: TopicKey,
  title: string,
  stay: StayDetails,
  keys: HouseRuleKey[] | "all",
): AnswerCard[] {
  const lines = houseRuleParts(stay.houseRules)
    .filter((p) => keys === "all" || keys.includes(p.key))
    .map((p) => p.text);
  if (lines.length === 0) return [];
  return [{ key: `${topic}:house`, title, lines, source: HOUSE_SOURCE, link: { label: "See all policies" } }];
}

/**
 * One card per topic's data, in the table's order. A topic the stay has no data for is dropped; when nothing is
 * left (no match, or no data) the reply is the single "no answer" card.
 */
export function answerFor(stay: StayDetails, topics: TopicKey[]): AnswerCard[] {
  const cards: AnswerCard[] = [];
  for (const topic of TOPICS.map((t) => t.key).filter((k) => topics.includes(k))) {
    switch (topic) {
      case "cancellation":
        cards.push(...policyCard(topic, stay.cancellationPolicy, CANCELLATION_SOURCE));
        break;
      case "checkIn":
        cards.push(...houseCard(topic, "Check-in and checkout", stay, ["checkIn", "checkOut"]));
        cards.push(...policyCard(topic, policyOf(stay, ["checkIn"]), ROAM_SOURCE));
        break;
      case "pets":
        cards.push(...houseCard(topic, "Pets", stay, ["pets"]));
        cards.push(...policyCard(topic, policyOf(stay, ["pets"]), ROAM_SOURCE));
        break;
      case "houseRules":
        cards.push(...houseCard(topic, "House rules", stay, "all"));
        break;
      case "payment":
        // The seed has "Booking & payment" (kind `booking`) and no `payment` policy: use `payment` when it exists.
        cards.push(...policyCard(topic, policyOf(stay, ["payment", "booking"]), ROAM_SOURCE));
        break;
      case "damage":
        cards.push(...policyCard(topic, policyOf(stay, ["damage"]), ROAM_SOURCE));
        break;
      case "guestRefund":
        cards.push(...policyCard(topic, policyOf(stay, ["guestRefund"]), ROAM_SOURCE));
        break;
    }
  }
  return cards.length > 0 ? cards : [NO_ANSWER];
}
