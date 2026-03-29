# Cursor Follower Sprite

A tiny browser-friendly cursor follower sprite you can drop into your own web app as an easter egg.

Live demo:
- [leeorlandi.github.io/cursor-follower-sprite](https://leeorlandi.github.io/cursor-follower-sprite/)

This project is a respectful nod to Rob Scanlon's original homepage sprite behavior:
- [Rob Scanlon on GitHub](https://github.com/arscan)
- [robscanlon.com](https://www.robscanlon.com/)

## Highlights

- A reusable ES module in [`src/index.js`](./src/index.js)
- A polished inspiration demo in [`demo/index.html`](./demo/index.html)
- Inline live controls for `speed`, `delayMs`, and `scale`

## Run locally

Serve the repo with any static server:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/` for a root redirect into the polished demo
- `http://localhost:4173/demo/` for the polished demo directly

## Quick start

The easiest path is to import the helper that creates and mounts the sprite for you:

```js
import { createCursorFollowerSprite } from "./src/index.js";

createCursorFollowerSprite({
  spriteUrl: "./assets/prince_final.png",
  speed: 82,
  scale: 1.45,
  delayMs: 1200,
});
```

If you want to manage the DOM node yourself:

```js
import { CursorFollowerSprite } from "./src/index.js";

const element = document.createElement("div");
document.body.appendChild(element);

const follower = new CursorFollowerSprite(element, {
  spriteUrl: "./assets/prince_final.png",
  speed: 82,
  scale: 1.45,
  delayMs: 1200,
});

follower.mount();
```

## Main config knobs

These are the controls surfaced directly in the main demo UI:

- `speed`: how quickly the sprite walks toward the cursor
- `delayMs`: how long it waits before appearing
- `scale`: how large the sprite appears on screen

Example:

```js
createCursorFollowerSprite({
  spriteUrl: "./assets/prince_final.png",
  speed: 110,
  scale: 1.75,
  delayMs: 2500,
});
```

## Full options

```js
createCursorFollowerSprite({
  spriteUrl: "./assets/prince_final.png",
  frameWidth: 25,
  frameHeight: 65,
  framesPerDirection: 6,
  frameDuration: 75,
  speed: 82,
  stopRadius: 6,
  spawnX: -60,
  spawnY: 220,
  scale: 1.45,
  delayMs: 1200,
  zIndex: 20,
});
```

## Demo

- [`demo/index.html`](./demo/index.html): the shipped demo page with the live control card and code preview

The demo is the product walkthrough now. It lets you tune the main knobs in place and see the matching config snippet immediately.

## Project structure

- [`src/CursorFollowerSprite.js`](./src/CursorFollowerSprite.js): core follower behavior
- [`src/defaults.js`](./src/defaults.js): shared defaults
- [`src/index.js`](./src/index.js): public entry point and convenience creator
- [`demo/demo.js`](./demo/demo.js): polished demo bootstrap
- [`demo/styles.css`](./demo/styles.css): demo presentation layer

## Cleanup and teardown

The helper returns the follower instance. If you mount this inside a framework component or a page that gets torn down, call `destroy()` and remove the element if you created it yourself.

```js
const follower = createCursorFollowerSprite({
  spriteUrl: "./assets/prince_final.png",
});

// later
follower.destroy();
follower.element.remove();
```

## Publishing note

The code is ready to reuse. The sprite art is the one thing you should review before publishing.

This repo currently uses the original sprite sheet for local proof of concept. If you publish or redistribute this project, replace the sprite with art you have permission to ship or secure rights for the original asset first.

If you want a safe public release flow:

- keep the code and API as-is
- replace `assets/prince_final.png` with original art you own
- keep the Rob Scanlon attribution in the README and polished demo
