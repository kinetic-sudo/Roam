import { styled } from "react-native-css";
import Svg, { Path } from "react-native-svg";

// Filled brand-yellow star. Drawn in SVG so the colour comes from a token class (no hex).
const StyledPath = styled(Path, { className: { target: false, nativeStyleMapping: { color: "fill" } } });

export function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <StyledPath d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" className="text-primary" />
    </Svg>
  );
}