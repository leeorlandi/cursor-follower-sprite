import {
  createCursorFollowerSprite,
  DEFAULT_CURSOR_FOLLOWER_OPTIONS,
} from "../src/index.js";

const form = document.querySelector("[data-config-form]");
const speedInput = document.querySelector("#speed");
const delayInput = document.querySelector("#delayMs");
const scaleInput = document.querySelector("#scale");
const speedValue = document.querySelector("[data-speed-value]");
const delayValue = document.querySelector("[data-delay-value]");
const scaleValue = document.querySelector("[data-scale-value]");
const codeBlock = document.querySelector("[data-code-preview]");

const baseConfig = {
  spriteUrl: "../assets/prince_final.png",
  scale: 1.45,
  spawnX: Math.max(24, window.innerWidth * 0.62),
  spawnY: 120,
  speed: DEFAULT_CURSOR_FOLLOWER_OPTIONS.speed,
  delayMs: 1200,
};

let follower = null;
follower = mountFollower();

function mountFollower() {
  if (follower) {
    follower.destroy();
    follower.element.remove();
  }

  const nextFollower = createCursorFollowerSprite(baseConfig);
  renderCodePreview();
  return nextFollower;
}

function renderCodePreview() {
  speedValue.textContent = `${baseConfig.speed}`;
  delayValue.textContent = `${baseConfig.delayMs}ms`;
  scaleValue.textContent = `${baseConfig.scale.toFixed(2)}x`;
  codeBlock.textContent = `createCursorFollowerSprite({
  spriteUrl: "/sprites/prince.png",
  speed: ${baseConfig.speed},
  scale: ${baseConfig.scale.toFixed(2)},
  delayMs: ${baseConfig.delayMs},
});`;
}

form.addEventListener("input", (event) => {
  if (event.target === speedInput) {
    baseConfig.speed = Number(speedInput.value);
    follower.updateOptions({ speed: baseConfig.speed });
  }

  if (event.target === delayInput) {
    baseConfig.delayMs = Number(delayInput.value);
    follower = mountFollower();
  }

  if (event.target === scaleInput) {
    baseConfig.scale = Number(scaleInput.value);
    follower.updateOptions({ scale: baseConfig.scale });
  }

  renderCodePreview();
});

form.addEventListener("reset", () => {
  window.requestAnimationFrame(() => {
    baseConfig.speed = Number(speedInput.value);
    baseConfig.delayMs = Number(delayInput.value);
    baseConfig.scale = Number(scaleInput.value);
    follower = mountFollower();
  });
});

window.addEventListener("resize", () => {
  baseConfig.spawnX = Math.max(24, window.innerWidth * 0.62);
  follower = mountFollower();
});

renderCodePreview();
