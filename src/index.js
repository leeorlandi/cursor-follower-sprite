import { CursorFollowerSprite } from "./CursorFollowerSprite.js?v=20260330-5";
import {
  DEFAULT_CURSOR_FOLLOWER_OPTIONS,
  DEFAULT_SPRITE_PALETTE,
} from "./defaults.js?v=20260330-5";

export {
  CursorFollowerSprite,
  DEFAULT_CURSOR_FOLLOWER_OPTIONS,
  DEFAULT_SPRITE_PALETTE,
};

export function createCursorFollowerSprite(options = {}) {
  const element = document.createElement("div");
  element.dataset.cursorFollowerSprite = "true";
  document.body.appendChild(element);

  const follower = new CursorFollowerSprite(element, options);
  follower.mount();
  return follower;
}
