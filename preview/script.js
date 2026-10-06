import { fairyDustCursor } from "./cursor-effects.js";

// Keep the original star trail, without the old animated background.
if (matchMedia("(pointer: fine)").matches) {
  new fairyDustCursor({ colors: ["#308b91", "#cfa657", "#a680a9"] });
  const canvas = document.querySelector("body > canvas");
  if (canvas) canvas.setAttribute("aria-hidden", "true");
}
