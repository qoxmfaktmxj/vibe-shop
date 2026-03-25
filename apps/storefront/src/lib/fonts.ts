import localFont from "next/font/local";

export const displayFont = localFont({
  src: [
    {
      path: "./GmarketSansTTFLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./GmarketSansTTFMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./GmarketSansTTFBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});
