export const P_GALLERY = [
  {
    id: "g1",
    g: "linear-gradient(150deg,#6FD4C4,#2E8C80)",
    cover: true,
    label: "Rooftop at sunrise",
  },
  {
    id: "g2",
    g: "linear-gradient(150deg,#5FC8B6,#268070)",
    label: "Sound bath setup",
  },
  {
    id: "g3",
    g: "linear-gradient(150deg,#7E8BE6,#3F49B0)",
    label: "Breathwork circle",
  },
  {
    id: "g4",
    g: "linear-gradient(150deg,#FBC15B,#E08B12)",
    label: "Golden hour flow",
  },
  {
    id: "g5",
    g: "linear-gradient(150deg,#FF9A57,#E36A1E)",
    label: "Studio interior",
  },
  {
    id: "g6",
    g: "linear-gradient(150deg,#9E7BF6,#5B33C9)",
    label: "Evening candlelit",
    video: true,
  },
] as {
  id: string;
  g: string;
  cover?: boolean;
  label: string;
  video?: boolean;
}[];
