import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { FadeInDown, LayoutAnimationConfig, ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnswerCard } from "@/components/ask/answer-card";
import { AskInput } from "@/components/ask/ask-input";
import { MessageBubble } from "@/components/ask/message-bubble";
import { TopicChips } from "@/components/ask/topic-chips";
import { stayIcons } from "@/components/stays/icon";
import { Button, IconButton, Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { track } from "@/lib/analytics";
import { answerFor, isAnswered, matchTopics, TOPICS, type AnswerCard as Card, type TopicKey } from "@/lib/ask";
import { tapSelection } from "@/lib/haptics";
import { easeOut, motion } from "@/theme";

// Built once, at module scope: a new message (and its cards) fades in and rises a little. Reduced motion drops it.
const MESSAGE_IN = FadeInDown.duration(motion.base).easing(easeOut).reduceMotion(ReduceMotion.System);

type Message =
  | { id: string; from: "roam" | "guest"; text: string }
  | { id: string; from: "answer"; cards: Card[] };

const OPENING =
  "Ask about check-in, pets, cancellation and more. Answers come word for word from this stay's details and Roam's policies.";

let counter = 0;
const nextId = () => `m${++counter}`;

/** "Ask about this stay": a chat of answer cards. No backend: topics are matched in code, answers come from the loaded stay. */
export default function AskScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stay, status, retry } = useStay(slug);

  const [messages, setMessages] = useState<Message[]>(() => [{ id: nextId(), from: "roam", text: OPENING }]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    track({ name: "stay_ask_opened", props: { slug } });
  }, [slug]);

  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const back = () =>
    router.canGoBack() ? router.back() : router.replace({ pathname: "/stay/[slug]", params: { slug } });

  /** Appends the guest's message, then the answer. A chip passes its topic directly; typed text is matched to topics. */
  const send = (text: string, from: "chip" | "typed", topics: TopicKey[]) => {
    if (!stay) return;
    const cards = answerFor(stay, topics);
    tapSelection();
    track({ name: "stay_ask_sent", props: { slug, from, topics, answered: isAnswered(cards) } });
    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "guest", text },
      { id: nextId(), from: "answer", cards },
    ]);
  };

  const sendTyped = (text: string) => {
    const q = text.trim();
    if (q) send(q, "typed", matchTopics(q));
  };
  const sendChip = (topic: TopicKey) => {
    const t = TOPICS.find((x) => x.key === topic);
    if (t) send(t.question, "chip", [topic]);
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-row items-center gap-3 border-b border-border px-5 py-2">
          <IconButton variant="muted" size="nav" name={stayIcons.chevronLeft} accessibilityLabel="Back" onPress={back} />
          <View className="flex-1">
            <Text variant="title">Ask about this stay</Text>
            {stay ? (
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {stay.title}
              </Text>
            ) : null}
          </View>
        </View>

        {status === "loading" ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="body" tone="muted" className="text-center">
              Loading this stay…
            </Text>
          </View>
        ) : status === "error" || !stay ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text variant="body" tone="muted" className="text-center">
              {status === "error" ? "We couldn't load this stay." : "This stay isn't available anymore."}
            </Text>
            <Button
              title={status === "error" ? "Try again" : "Back"}
              variant="secondary"
              size="sm"
              onPress={status === "error" ? retry : back}
            />
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerClassName="gap-4 px-5 py-5"
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {/* skipEntering: the opening message is there at once; only messages sent later animate. */}
              <LayoutAnimationConfig skipEntering>
                {messages.map((m) => (
                  <Animated.View key={m.id} entering={MESSAGE_IN}>
                    {m.from === "answer" ? (
                      <View className="gap-2.5 self-stretch">
                        {m.cards.map((card) => (
                          <AnswerCard key={card.key} card={card} slug={slug} />
                        ))}
                      </View>
                    ) : (
                      <MessageBubble from={m.from} text={m.text} />
                    )}
                  </Animated.View>
                ))}
              </LayoutAnimationConfig>
            </ScrollView>

            <View
              className="gap-3 border-t border-border bg-surface pt-3"
              style={{ paddingBottom: keyboardOpen ? 8 : insets.bottom + 8 }}
            >
              <TopicChips onAsk={sendChip} />
              <AskInput onSend={sendTyped} />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
