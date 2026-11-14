import { styled } from "react-native-css";
import Svg, { Path } from "react-native-svg";

// Filled location pin with a hole, as in the design. Colour comes from a token class (default white).
const FillPath = styled(Path, { className: { target: false, nativeStyleMapping: { color: "fill" } } });

export function PinIcon({ size = 18, className = "text-surface" }: { size?: number; className?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <FillPath
        fillRule="evenodd"
        d="M12 2a8 8 0 0 0-8 8c0 5.4 5.3 10.4 7.2 11.9a1.3 1.3 0 0 0 1.6 0C14.7 20.4 20 15.4 20 10a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        className={className}
      />
    </Svg>
  );
}