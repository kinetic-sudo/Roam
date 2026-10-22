import { useWindowDimensions } from "react-native";
import { styled } from "react-native-css"; // adjust to wherever the project imports `styled`
import Svg, { Path } from "react-native-svg";

// Path has no `style` prop, so className's `color` is mapped onto `fill`.
const StyledPath = styled(Path, {
  className: { target: false, nativeStyleMapping: { color: "fill" } },
});
const StyledSvg = styled(Svg, { className: "style" });

export const CURVE_HEIGHT = 64;

/** Curved top edge of the bottom sheet: rounded top-left, falling gently to a big rounded corner on the right. */
export function SheetCurve() {
  const { width: w } = useWindowDimensions();
  const h = CURVE_HEIGHT;
  const d = [
    `M0 ${h}`,
    `L0 30`,
    `C0 12 12 3 32 5`, // top-left corner (~24)
    `C${w * 0.45} 11 ${w * 0.75} 24 ${w - 52} 44`, // gentle fall
    `C${w - 22} 54 ${w} 58 ${w} ${h}`, // large right corner
    `Z`,
  ].join(" ");

  return (
    <StyledSvg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute left-0 top-0">
      <StyledPath d={d} className="text-surface" />
    </StyledSvg>
  );
}