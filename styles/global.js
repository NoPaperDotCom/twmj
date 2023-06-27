import { M } from "de/utils";
const _screenRatio = [0.2, 0.48, 0.65, 0.8, 1];
export default {
  color: {
    complementary: { h: 180, s: 0.5, l: 0.5 },
    antisimilar1: { h: -30, s: 0.5, l: 0.5},
    antisimilar2: { h: -60, s: 0.5, l: 0.5},
    similar1: { h: 30, s: 0.5, l: 0.5},
    similar2: { h: 60, s: 0.5, l: 0.5},
    antitri: { h: -120, s: 0.5, l: 0.5},
    tri: { h: 120, s: 0.5, l: 0.5},
    darken: { s: 0.3, l: 0.35 },
    natural: { s: 0.5, l: 0.5 },
    lighten: { s: 0.6, l: 0.85 },
    white: { s: 1, l: 1 },
    grey: { s: 0, l: 0.95 },
    black: { s: 0, l: 0 }
  },
  groupbtnshape: {
    start: M("()", "#", "#", "(]", "#"),
    middle: M("()", "#", "#", "[]", "#"),
    end: M("()", "#", "#", "[)", "#")
  },
  layout: {
    fullwidth: ["100%", "auto"],
    column: (ratio) => M(["100%", "auto"], "#", "#", [`${ratio * 100}%`, "auto"], "#"),
  },
  imageSize: {
    small: M([0.48 * 2.5, "s"], "#", [0.65 * 2.5, "s"], [0.8 * 2.5, "s"], [2.5, "s"]),
    medium: M([0.48 * 5, "s"], "#", [0.65 * 5, "s"], [0.8 * 5, "s"], [5, "s"]),
    large: M([0.48 * 10, "s"], "#", [0.65 * 10, "s"], [0.8 * 10, "s"], [10, "s"]),
    qrcode: M([32, "auto"], "#", "#", [16, "auto"], "#")
  },
  textSize: {
    small: M(0.48 * 1.5, "#", 0.65 * 1.5, 0.8 * 1.5, 1.5),
    medium: M(0.48 * 2, "#", 0.65 * 2, 0.8 * 2, 2),
    large: M(0.48 * 3, "#", 0.65 * 3, 0.8 * 3, 3),
    small2step: M(0.48 * 2, "#", 1, "#", "#")
  },
  animation: {
    fadeIn: {
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      duration: 0.5,
      delay: 0,
      timeFunction: "ease-in-out",
      fillMode: "both",
      count: 1,
      alternate: false
    }
  }
};
/*

  padding: {
    small: M(),
    medium: M(),
    large: M()
  },
  gap: {
    small: M(),
    medium: M(),
    large: M()
  },
};
*/