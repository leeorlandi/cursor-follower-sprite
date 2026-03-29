import { CursorFollowerSprite } from "./CursorFollowerSprite.js";
import { DEFAULT_CURSOR_FOLLOWER_OPTIONS } from "./defaults.js";

export { CursorFollowerSprite, DEFAULT_CURSOR_FOLLOWER_OPTIONS };

export function createCursorFollowerSprite(options = {}) {
  const element = document.createElement("div");
  element.dataset.cursorFollowerSprite = "true";
  document.body.appendChild(element);

  const follower = new CursorFollowerSprite(element, options);
  follower.mount();
  return follower;
}
