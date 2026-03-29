import {
  DEFAULT_CURSOR_FOLLOWER_OPTIONS,
  DEFAULT_SPRITE_PALETTE,
} from "./defaults.js";

const imageCache = new Map();
const recolorCache = new Map();

function normalizeHex(hex) {
  if (typeof hex !== "string") {
    return null;
  }

  const value = hex.trim().toLowerCase();
  if (!/^#([0-9a-f]{6})$/.test(value)) {
    return null;
  }

  return value;
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function getPaletteKey(spriteUrl, palette) {
  return `${spriteUrl}::${JSON.stringify(palette)}`;
}

function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load sprite image: ${src}`));
        image.src = src;
      }),
    );
  }

  return imageCache.get(src);
}

async function recolorSprite(spriteUrl, palette) {
  const paletteKey = getPaletteKey(spriteUrl, palette);
  if (recolorCache.has(paletteKey)) {
    return recolorCache.get(paletteKey);
  }

  const image = await loadImage(spriteUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = new Map(
    Object.entries(DEFAULT_SPRITE_PALETTE).map(([name, sourceHex]) => {
      const source = hexToRgb(sourceHex);
      const target = hexToRgb(palette[name] ?? sourceHex);
      return [`${source.r},${source.g},${source.b}`, target];
    }),
  );

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) {
      continue;
    }

    const replacement = colorMap.get(`${data[index]},${data[index + 1]},${data[index + 2]}`);
    if (!replacement) {
      continue;
    }

    data[index] = replacement.r;
    data[index + 1] = replacement.g;
    data[index + 2] = replacement.b;
  }

  context.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  recolorCache.set(paletteKey, dataUrl);
  return dataUrl;
}

export class CursorFollowerSprite {
  constructor(element, options = {}) {
    if (!element) {
      throw new Error("CursorFollowerSprite requires a mount element.");
    }

    this.element = element;
    this.options = { ...DEFAULT_CURSOR_FOLLOWER_OPTIONS, ...options };

    if (!this.options.spriteUrl) {
      throw new Error("CursorFollowerSprite requires a spriteUrl option.");
    }

    this.position = { x: this.options.spawnX, y: this.options.spawnY };
    this.target = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
    };
    this.direction = 3;
    this.frame = 0;
    this.isMoving = true;
    this.lastTick = performance.now();
    this.lastFrameChange = this.lastTick;
    this.pointerHandler = this.handlePointerMove.bind(this);
    this.rafId = 0;
    this.startAt = this.lastTick + this.options.delayMs;
    this.isStarted = this.options.delayMs === 0;
    this.spriteRenderId = 0;
    this.appliedSpriteKey = "";

    this.applyElementStyles();
  }

  mount() {
    window.addEventListener("pointermove", this.pointerHandler);
    this.render();
    this.rafId = window.requestAnimationFrame(this.tick.bind(this));
  }

  destroy() {
    window.removeEventListener("pointermove", this.pointerHandler);
    window.cancelAnimationFrame(this.rafId);
  }

  updateOptions(nextOptions = {}) {
    const previousDelayMs = this.options.delayMs;
    const nextMergedOptions = { ...this.options, ...nextOptions };
    if (Object.hasOwn(nextOptions, "palette")) {
      nextMergedOptions.palette =
        nextOptions.palette === null
          ? null
          : { ...(this.options.palette ?? {}), ...nextOptions.palette };
    }

    this.options = nextMergedOptions;
    this.applyElementStyles();

    if (
      typeof nextOptions.spawnX === "number" ||
      typeof nextOptions.spawnY === "number"
    ) {
      this.position = { x: this.options.spawnX, y: this.options.spawnY };
    }

    if (
      typeof nextOptions.delayMs === "number" &&
      nextOptions.delayMs !== previousDelayMs
    ) {
      this.restartDelay();
    }

    this.render();
  }

  restartDelay() {
    this.startAt = performance.now() + this.options.delayMs;
    this.isStarted = this.options.delayMs === 0;
    this.frame = 0;
  }

  handlePointerMove(event) {
    this.target.x = event.clientX;
    this.target.y = event.clientY;
  }

  tick(now) {
    const deltaMs = now - this.lastTick;
    this.lastTick = now;

    if (!this.isStarted) {
      if (now >= this.startAt) {
        this.isStarted = true;
      } else {
        this.render();
        this.rafId = window.requestAnimationFrame(this.tick.bind(this));
        return;
      }
    }

    const deltaX = this.target.x - (this.position.x + this.options.frameWidth / 2);
    const deltaY =
      this.target.y - (this.position.y + this.options.frameHeight / 2);
    const distance = Math.hypot(deltaX, deltaY);

    this.isMoving = distance > this.options.stopRadius;

    if (this.isMoving) {
      const travel = (this.options.speed * deltaMs) / 1000;
      const step = Math.min(travel, distance);
      const unitX = distance === 0 ? 0 : deltaX / distance;
      const unitY = distance === 0 ? 0 : deltaY / distance;

      this.position.x += unitX * step;
      this.position.y += unitY * step;

      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        this.direction = deltaX >= 0 ? 0 : 1;
      } else {
        this.direction = deltaY >= 0 ? 2 : 3;
      }

      if (now - this.lastFrameChange >= this.options.frameDuration) {
        this.frame = (this.frame + 1) % this.options.framesPerDirection;
        this.lastFrameChange = now;
      }
    } else {
      this.frame = 0;
      this.lastFrameChange = now;
    }

    this.render();
    this.rafId = window.requestAnimationFrame(this.tick.bind(this));
  }

  render() {
    const offsetX = this.frame * this.options.frameWidth;
    const offsetY = this.direction * this.options.frameHeight;

    this.element.style.opacity = this.isStarted ? "1" : "0";
    this.element.style.transform =
      `translate(${this.position.x}px, ${this.position.y}px) scale(${this.options.scale})`;
    this.element.style.backgroundPosition = `-${offsetX}px -${offsetY}px`;
  }

  applyElementStyles() {
    this.element.setAttribute("aria-hidden", "true");
    this.element.style.position = "fixed";
    this.element.style.left = "0";
    this.element.style.top = "0";
    this.element.style.width = `${this.options.frameWidth}px`;
    this.element.style.height = `${this.options.frameHeight}px`;
    this.element.style.pointerEvents = "none";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.imageRendering = "pixelated";
    this.element.style.willChange = "transform, background-position, opacity";
    this.element.style.transformOrigin = "top left";
    this.element.style.zIndex = `${this.options.zIndex}`;

    this.applyBackgroundImage();
  }

  async applyBackgroundImage() {
    const palette =
      this.options.palette === null
        ? null
        : { ...DEFAULT_SPRITE_PALETTE, ...(this.options.palette ?? {}) };
    const spriteKey = getPaletteKey(this.options.spriteUrl, palette);
    if (spriteKey === this.appliedSpriteKey) {
      return;
    }

    this.appliedSpriteKey = spriteKey;
    const renderId = ++this.spriteRenderId;

    try {
      const spriteImage = palette
        ? await recolorSprite(this.options.spriteUrl, palette)
        : this.options.spriteUrl;

      if (renderId !== this.spriteRenderId) {
        return;
      }

      this.element.style.backgroundImage = `url("${spriteImage}")`;
    } catch (error) {
      console.error(error);
      this.element.style.backgroundImage = `url("${this.options.spriteUrl}")`;
    }
  }
}
