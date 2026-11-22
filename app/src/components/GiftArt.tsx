import Svg, { Path, Rect, Circle, G, Ellipse } from "react-native-svg";
export function GiftArt({
  size = 260,
  variant = "blue",
}: {
  size?: number;
  variant?: "blue" | "coral" | "mint";
}) {
  const box =
    variant === "coral"
      ? "#FF816A"
      : variant === "mint"
        ? "#9FD6BA"
        : "#4F80F6";
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 320 262" aria-hidden>
      <Ellipse
        cx="165"
        cy="239"
        rx="117"
        ry="13"
        fill="#202C3E"
        opacity=".08"
      />
      <Path d="m34 67 6-15 6 15 15 6-15 6-6 15-6-15-15-6Z" fill="#FFD86A" />
      <Path d="m272 159 4-11 4 11 11 4-11 4-4 11-4-11-11-4Z" fill="#FFD86A" />
      <Circle cx="263" cy="44" r="6" fill="#C5EDDA" />
      <Circle cx="52" cy="181" r="5" fill="#FFAA94" />
      <Path
        d="m91 32-7-9m159 79 13-4M36 121l-11 2m199 101 7 9"
        stroke="#FFAA94"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <G transform="rotate(-9 132 150)">
        <Rect x="64" y="111" width="160" height="118" rx="14" fill={box} />
        <Path d="M64 122h160v19H64Z" fill="#202C3E" opacity=".08" />
        <Rect
          x="54"
          y="91"
          width="180"
          height="38"
          rx="9"
          fill={
            variant === "coral"
              ? "#FF9E89"
              : variant === "mint"
                ? "#BDE9D1"
                : "#709AFA"
          }
        />
        <Path d="M129 91h30v138h-30Z" fill="#FFD86A" />
        <Path
          d="M143 91C106 94 88 69 103 56c17-15 41 14 40 35Zm1 0c-1-37 14-60 29-48 19 16-2 45-29 48Z"
          fill="none"
          stroke="#FFD86A"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M86 161h22m-22 12h14"
          stroke="white"
          strokeWidth="4"
          opacity=".7"
          strokeLinecap="round"
        />
      </G>
      <G transform="rotate(12 232 190)">
        <Rect x="190" y="177" width="94" height="60" rx="8" fill="#FF816A" />
        <Rect x="184" y="164" width="106" height="23" rx="6" fill="#FFAA94" />
        <Path d="M228 164h18v73h-18Z" fill="#FFF2C6" />
        <Path
          d="M236 164c-29 1-39-15-28-22 12-8 24 8 28 22Zm1 0c1-23 15-32 22-22 9 12-6 21-22 22Z"
          fill="none"
          stroke="#FFF2C6"
          strokeWidth="8"
        />
      </G>
    </Svg>
  );
}
