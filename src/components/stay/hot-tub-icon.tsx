import { styled } from "react-native-css";
import Svg, { Path } from "react-native-svg";

// A tub with three wisps of steam, as in the design (SF Symbols has no hot tub; `bathtub` reads as a bath).
// Colour comes from a token class, like StarIcon and PinIcon.
const StrokePath = styled(Path, { className: { target: false, nativeStyleMapping: { color: "stroke" } } });

export function HotTubIcon({ size = 28, className = "text-ink" }: { size?: number; className?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <StrokePath d="M8 7.2c-1.2-1.3 1.2-2.2 0-3.6M12 7.2c-1.2-1.3 1.2-2.2 0-3.6M16 7.2c-1.2-1.3 1.2-2.2 0-3.6" strokeWidth={1.7} strokeLinecap="round" fill="none" className={className} />
      <StrokePath d="M2.8 11.6h18.4v3A5.4 5.4 0 0 1 15.8 20H8.2a5.4 5.4 0 0 1-5.4-5.4Z" strokeWidth={1.7} strokeLinejoin="round" fill="none" className={className} />
    </Svg>
  );
}
