import {
  createCursorFollowerSprite,
  DEFAULT_CURSOR_FOLLOWER_OPTIONS,
  DEFAULT_SPRITE_PALETTE,
} from "../src/index.js";

const form = document.querySelector("[data-config-form]");
const presetGrid = document.querySelector("[data-palette-presets]");
const speedInput = document.querySelector("#speed");
const delayInput = document.querySelector("#delayMs");
const scaleInput = document.querySelector("#scale");
const speedValue = document.querySelector("[data-speed-value]");
const delayValue = document.querySelector("[data-delay-value]");
const scaleValue = document.querySelector("[data-scale-value]");
const codeBlock = document.querySelector("[data-code-preview]");

const PALETTE_PRESETS = {
  Original: { ...DEFAULT_SPRITE_PALETTE },
  Forest: {
    slot1: "#384d32",
    slot2: "#4c8c62",
    slot3: "#a7d9bc",
    slot4: "#6e3e28",
    slot5: "#a85c3a",
    slot6: "#d7b55b",
    slot7: "#c9d6c1",
  },
  Ice: {
    slot1: "#35526b",
    slot2: "#4e9fcb",
    slot3: "#b7ecff",
    slot4: "#587ea0",
    slot5: "#7fb0d8",
    slot6: "#eefcff",
    slot7: "#d8e9f8",
  },
  Sunset: {
    slot1: "#52343b",
    slot2: "#486d83",
    slot3: "#f0c8a8",
    slot4: "#b43c43",
    slot5: "#ef7f57",
    slot6: "#ffd36b",
    slot7: "#f2ddd1",
  },
  Mono: {
    slot1: "#2f3540",
    slot2: "#5a6572",
    slot3: "#c4cbd3",
    slot4: "#424854",
    slot5: "#8a95a3",
    slot6: "#e9edf2",
    slot7: "#b4bcc6",
  },
};

const baseConfig = {
  spriteUrl: "../assets/prince_final.png",
  palette: { ...DEFAULT_SPRITE_PALETTE },
  scale: 1.45,
  spawnX: Math.max(24, window.innerWidth * 0.48),
  spawnY: 72,
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
  palette: {
    slot1: "${baseConfig.palette.slot1}",
    slot2: "${baseConfig.palette.slot2}",
    slot3: "${baseConfig.palette.slot3}",
    slot4: "${baseConfig.palette.slot4}",
    slot5: "${baseConfig.palette.slot5}",
    slot6: "${baseConfig.palette.slot6}",
    slot7: "${baseConfig.palette.slot7}",
  },
});`;
}

function applyPalette(palette) {
  baseConfig.palette = { ...palette };
  follower.updateOptions({ palette: baseConfig.palette });
  renderCodePreview();
}

function renderPresetButtons() {
  presetGrid.innerHTML = "";

  Object.entries(PALETTE_PRESETS).forEach(([label, palette]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = label;
    button.addEventListener("click", () => applyPalette(palette));
    presetGrid.appendChild(button);
  });
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
    baseConfig.palette = { ...DEFAULT_SPRITE_PALETTE };
    follower = mountFollower();
  });
});

window.addEventListener("resize", () => {
  baseConfig.spawnX = Math.max(24, window.innerWidth * 0.48);
  follower = mountFollower();
});

renderPresetButtons();
renderCodePreview();
