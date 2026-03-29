import { DEFAULT_CURSOR_FOLLOWER_OPTIONS } from "./defaults.js";

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
    this.options = { ...this.options, ...nextOptions };
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
    this.element.style.backgroundImage = `url("${this.options.spriteUrl}")`;
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.imageRendering = "pixelated";
    this.element.style.willChange = "transform, background-position, opacity";
    this.element.style.transformOrigin = "top left";
    this.element.style.zIndex = `${this.options.zIndex}`;
  }
}
