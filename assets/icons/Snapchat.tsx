import { createIcon, Icon } from "@/components/ui/icon";
import React from "react";
import { Svg, Path, Rect, Defs, LinearGradient, Stop } from "react-native-svg";

const Snapchat = (props: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}) => {
  const GluestackIcon = createIcon({
    viewBox: "0 0 24 24",
    path: (
      <>
        <Path
          d="M18 8.75C18 -0.25 6 -0.25 6 8.75V10.25H4.372C3.789 10.25 3.549 10.999 4.024 11.338L6 12.75C5.667 13.917 4.3 16.45 1.5 17.25C1.833 17.75 2.8 18.75 4 18.75L5 20.25L7.5 19.75C8.333 20.417 10.4 21.75 12 21.75C13.6 21.75 15.667 20.417 16.5 19.75L19 20.25L20 18.75C21.2 18.75 22.167 17.75 22.5 17.25C19.7 16.45 18.333 13.917 18 12.75L19.976 11.338C20.451 10.999 20.211 10.25 19.628 10.25H18V8.75Z"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </>
    ),
  });
  return <Icon {...props} as={GluestackIcon} />;
};

export default Snapchat;
