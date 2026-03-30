# Cursor Follower Sprite

A tiny browser-friendly cursor follower sprite you can drop into your own web app as an easter egg.

Live demo:
- [leeorlandi.github.io/cursor-follower-sprite](https://leeorlandi.github.io/cursor-follower-sprite/)

This project is a respectful nod to Rob Scanlon's original homepage sprite behavior:
- [Rob Scanlon on GitHub](https://github.com/arscan)
- [robscanlon.com](https://www.robscanlon.com/)

## Highlights

- A reusable ES module in [`src/index.js`](./src/index.js)
- A polished demo in [`demo/index.html`](./demo/index.html)
- Inline live controls for `speed`, `delayMs`, `scale`, `smoothness`, and color presets
- Palette-aware sprite recoloring built into the module itself
- Desktop mouse tracking plus touch-friendly tap targeting

## Release notes

- Added a `smoothness` motion setting with four presets: `Smooth`, `Classic`, `Retro`, and `Chunky`
- `Smooth` keeps full pixel-by-pixel movement, `Classic` adds light stepping, `Retro` adds more visible snap, and `Chunky` is the most deliberately old-school
- The demo now exposes smoothness as preset buttons and includes the iOS touch fixes needed to make the follower behave correctly on mobile

## Run locally

Serve the repo with any static server:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/` for a root redirect into the demo
- `http://localhost:4173/demo/` for the demo directly

## Quick start

The easiest path is to import the helper that creates and mounts the sprite for you:

```js
import { createCursorFollowerSprite } from "./src/index.js";

createCursorFollowerSprite({
  spriteUrl: "/sprites/prince.png",
  smoothness: 4,
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
  spriteUrl: "/sprites/prince.png",
  smoothness: 4,
  speed: 82,
  scale: 1.45,
  delayMs: 1200,
});

follower.mount();
```

## Main config knobs

These are the controls surfaced directly in the demo UI:

- `speed`: how quickly the sprite walks toward the cursor
- `delayMs`: how long it waits before appearing
- `scale`: how large the sprite appears on screen
- `smoothness`: how fluid or choppy the rendered motion feels, from `4` (`Smooth`) down to `1` (`Chunky`)
- `palette`: a 7-slot palette object used for runtime recoloring

## Input behavior

- On desktop, the sprite tracks live mouse movement.
- On touch devices, taps act like a cursor target and the sprite walks to the tapped point.
- Touches on form controls are ignored so sliders and buttons do not accidentally retarget the sprite.

Example:

```js
createCursorFollowerSprite({
  spriteUrl: "/sprites/prince.png",
  smoothness: 2,
  speed: 110,
  scale: 1.75,
  delayMs: 2500,
  palette: {
    slot1: "#2f3540",
    slot2: "#5a6572",
    slot3: "#c4cbd3",
    slot4: "#424854",
    slot5: "#8a95a3",
    slot6: "#e9edf2",
    slot7: "#b4bcc6",
  },
});
```

## Palette

The sprite uses seven visible palette slots plus transparency. The module exposes those slots generically so your themes are not tied to the original costume colors.

The built-in palette export is:

```js
import { DEFAULT_SPRITE_PALETTE } from "./src/index.js";
```

Shape:

```js
{
  slot1: "#525552",
  slot2: "#00aaad",
  slot3: "#52ffff",
  slot4: "#ad0000",
  slot5: "#ff5552",
  slot6: "#ffff52",
  slot7: "#adaaad",
}
```

If you do not pass `palette`, the original sprite colors are used. If you pass a partial palette, only those slots are replaced.

## Full options

```js
createCursorFollowerSprite({
  spriteUrl: "/sprites/prince.png",
  frameWidth: 25,
  frameHeight: 65,
  framesPerDirection: 6,
  frameDuration: 75,
  smoothness: 4,
  speed: 82,
  stopRadius: 6,
  spawnX: -60,
  spawnY: 220,
  scale: 1.45,
  delayMs: 1200,
  palette: {
    slot1: "#525552",
    slot2: "#00aaad",
    slot3: "#52ffff",
    slot4: "#ad0000",
    slot5: "#ff5552",
    slot6: "#ffff52",
    slot7: "#adaaad",
  },
  zIndex: 20,
});
```

## Demo

- [`demo/index.html`](./demo/index.html): the shipped demo page with inline controls, theme presets, and the live config preview

The demo is the product walkthrough now. It lets you tune the main knobs in place and preview palette changes immediately.

## Project structure

- [`src/CursorFollowerSprite.js`](./src/CursorFollowerSprite.js): core follower behavior and runtime palette recoloring
- [`src/defaults.js`](./src/defaults.js): shared defaults and the default sprite palette
- [`src/index.js`](./src/index.js): public entry point and convenience creator
- [`demo/demo.js`](./demo/demo.js): demo bootstrap and interactive controls
- [`demo/styles.css`](./demo/styles.css): demo presentation layer

## Cleanup and teardown

The helper returns the follower instance. If you mount this inside a framework component or a page that gets torn down, call `destroy()` and remove the element if you created it yourself.

```js
const follower = createCursorFollowerSprite({
  spriteUrl: "/sprites/prince.png",
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
