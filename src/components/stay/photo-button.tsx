import { Icon, PressableScale, type IconName, type Tone } from "@/components/ui";

/** The white round button over the photo: back, share, heart. 56 pt, raised, scales on press. */
export function PhotoButton({
  name,
  label,
  onPress,
  tone,
  selected,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  tone?: Tone;
  selected?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      className="size-14 items-center justify-center rounded-full bg-surface shadow-raised"
    >
      <Icon name={name} size={24} tone={tone} />
    </PressableScale>
  );
}
