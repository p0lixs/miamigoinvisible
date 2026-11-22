import Svg, { Path, Rect, Circle } from "react-native-svg";
export type IconName =
  | "home"
  | "gift"
  | "heart"
  | "people"
  | "plus"
  | "close"
  | "calendar"
  | "copy"
  | "lock"
  | "mail"
  | "photo"
  | "check"
  | "settings"
  | "sparkle"
  | "trash"
  | "link"
  | "help";
export function Icon({
  name,
  size = 22,
  color = "currentColor",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const shapes = {
    home: (
      <>
        <Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <Path d="M9 21v-8h6v8" />
      </>
    ),
    gift: (
      <>
        <Rect x="3" y="8" width="18" height="4" rx="1" />
        <Path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3Zm0 0h4a3 3 0 1 0-3-3Z" />
      </>
    ),
    heart: (
      <Path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    people: (
      <>
        <Circle cx="9" cy="8" r="3" />
        <Path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m5 10v-3a6 6 0 0 0-3-5" />
      </>
    ),
    plus: <Path d="M12 5v14M5 12h14" />,
    close: <Path d="m6 6 12 12M6 18 18 6" />,
    calendar: (
      <>
        <Rect x="3" y="5" width="18" height="16" rx="3" />
        <Path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" />
      </>
    ),
    copy: (
      <>
        <Rect x="8" y="8" width="13" height="13" rx="2" />
        <Path d="M16 8V3H3v13h5" />
      </>
    ),
    lock: (
      <>
        <Rect x="5" y="10" width="14" height="11" rx="3" />
        <Path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </>
    ),
    mail: (
      <>
        <Rect x="3" y="5" width="18" height="14" rx="3" />
        <Path d="m3 7 9 6 9-6" />
      </>
    ),
    photo: (
      <>
        <Rect x="3" y="3" width="18" height="18" rx="3" />
        <Circle cx="8" cy="8" r="1" />
        <Path d="m3 17 5-5 4 4 3-3 6 6" />
      </>
    ),
    check: <Path d="m5 12 4 4L19 6" />,
    settings: (
      <>
        <Path d="m10 3-1 3-3 1-3-1-1 4 2 2v3l-1 2 3 3 2-1h3l2 2 4-2-1-3 1-3 3-1-1-4-3-1-2-2-1-2Z" />
        <Circle cx="12" cy="12" r="3" />
      </>
    ),
    sparkle: (
      <>
        <Path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4m-2-2h4" />
      </>
    ),
    trash: (
      <>
        <Path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
    link: (
      <>
        <Path d="m10 13 4-4m-6 6-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0m2 1 2-2a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0" />
      </>
    ),
    help: (
      <>
        <Circle cx="12" cy="12" r="9" />
        <Path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2m0 3h.01" />
      </>
    ),
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {shapes[name]}
    </Svg>
  );
}
