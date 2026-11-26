const canvas = document.getElementById("fireCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 80;
const HEIGHT = 60;
const SCALE = 8;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const firePixels = new Array(WIDTH * HEIGHT).fill(0);

// The original Pixel Fire palette is kept as the default theme.
const originalPalette = [
  "#070707", "#1f0707", "#2f0f07", "#470f07", "#571707", "#671f07",
  "#771f07", "#8f2707", "#9f2f07", "#af3f07", "#bf4707", "#c74707",
  "#df4f07", "#df5707", "#df5707", "#d75f07", "#d7670f", "#cf6f0f",
  "#cf770f", "#cf7f0f", "#cf8717", "#c78717", "#c78f17", "#c7971f",
  "#bf9f1f", "#bf9f1f", "#bfa727", "#bfa727", "#bfaf2f", "#b7af2f",
  "#b7b72f", "#b7b737", "#cfcf6f", "#dfdf9f", "#efefc7", "#ffffff"
];

const themeStops = {
  classic: ["#070707", "#351006", "#a52d08", "#f16b16", "#ffc45c", "#ffffff"],
  blue: ["#050914", "#092c58", "#086f9f", "#20b8d0", "#a4f4ff", "#ffffff"],
  violet: ["#090512", "#2d125b", "#7023a0", "#d33f91", "#ff9bc0", "#fff0fa"],
  white: ["#090909", "#44413d", "#a9a29a", "#e0d5c2", "#fff1d8", "#ffffff"]
};

let palette = originalPalette.slice();
let fireStrength = palette.length - 1;
let animationTime = 0;
let running = true;
let speed = 2;
let wind = 0;
let embersEnabled = true;
let frameSkip = 0;
let embers = [];
let lastFrameTime = 0;

const $ = (id) => document.getElementById(id);

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function makePalette(stops, count) {
  const colors = stops.map(hexToRgb);
  const result = [];
  for (let i = 0; i < count; i++) {
    const position = (i / (count - 1)) * (colors.length - 1);
    const left = Math.floor(position);
    const right = Math.min(colors.length - 1, left + 1);
    const mix = position - left;
    const rgb = ["r", "g", "b"].map((channel) =>
      Math.round(colors[left][channel] + (colors[right][channel] - colors[left][channel]) * mix)
    );
    result.push("#" + rgb.map((part) => part.toString(16).padStart(2, "0")).join(""));
  }
  return result;
}

function createFireSource() {
  for (let x = 0; x < WIDTH; x++) {
    firePixels[(HEIGHT - 1) * WIDTH + x] = fireStrength;
  }
}

function updateFire() {
  for (let y = 1; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const src = y * WIDTH + x;
      const decay = Math.floor(Math.random() * 3);
      const drift = Math.round((Math.random() - 0.5) * Math.abs(wind));
      const direction = wind === 0 ? 0 : Math.sign(wind) * Math.max(0, Math.abs(wind) - Math.abs(drift));
      const dstX = Math.max(0, Math.min(WIDTH - 1, x - decay + direction));
      const dst = src - WIDTH + dstX - x;
      if (dst < 0 || dst >= firePixels.length) continue;
      firePixels[dst] = Math.max(firePixels[src] - decay, 0);
    }
  }
}

function addEmbers() {
  if (!embersEnabled) return;
  if (Math.random() < 0.32) {
    embers.push({
      x: Math.random() * WIDTH,
      y: HEIGHT - 3,
      life: 16 + Math.random() * 28,
      size: Math.random() > 0.8 ? 1.5 : 1,
      drift: (Math.random() - 0.5) * 0.5
    });
  }
  ctx.save();
  ctx.fillStyle = "#ffd18a";
  embers = embers.filter((ember) => ember.life > 0 && ember.y > 0);
  for (const ember of embers) {
    ember.x += ember.drift + wind * 0.08;
    ember.y -= 0.35 + Math.random() * 0.35;
    ember.life -= 1;
    ctx.globalAlpha = Math.min(1, ember.life / 12);
    ctx.fillRect(Math.round(ember.x), Math.round(ember.y), ember.size, ember.size);
  }
  ctx.restore();
}

function renderFire() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const level = Math.max(0, Math.min(palette.length - 1, firePixels[y * WIDTH + x]));
      ctx.fillStyle = palette[level] || palette[0];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  addEmbers();
}

function animate(timestamp = 0) {
  requestAnimationFrame(animate);
  if (!running) return;
  const frameDelay = speed === 1 ? 42 : speed === 2 ? 24 : 12;
  if (timestamp - lastFrameTime < frameDelay) return;
  lastFrameTime = timestamp;
  animationTime += 1;
  frameSkip += 1;
  createFireSource();
  updateFire();
  renderFire();
}

function setIntensity(value) {
  fireStrength = Math.max(1, Math.min(palette.length - 1, Number(value)));
  $("intensity").value = fireStrength;
  $("intensityValue").textContent = `${fireStrength} / ${palette.length - 1}`;
  createFireSource();
}

function setPalette(name) {
  palette = name === "classic" ? originalPalette.slice() : makePalette(themeStops[name], 36);
  fireStrength = Math.min(fireStrength, palette.length - 1);
  $("paletteSelect").value = name;
  $("intensity").max = palette.length - 1;
  $("intensityValue").textContent = `${fireStrength} / ${palette.length - 1}`;
  createFireSource();
}

function resetFire() {
  firePixels.fill(0);
  embers = [];
  setIntensity(35);
  wind = 0;
  speed = 2;
  $("wind").value = "0";
  $("windValue").textContent = "Calm";
  $("speed").value = "2";
  $("speedValue").textContent = "Normal";
  $("paletteSelect").value = "classic";
  setPalette("classic");
  document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("selected", button.dataset.preset === "campfire"));
  renderFire();
}

function setRunning(value) {
  running = value;
  $("playIcon").textContent = running ? "Ⅱ" : "▶";
  $("playLabel").textContent = running ? "Pause" : "Resume";
  $("engineState").textContent = running ? "RUNNING" : "PAUSED";
  $("engineState").style.color = running ? "#7fd4a4" : "#ffb181";
}

function sparkAt(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * WIDTH);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || px >= WIDTH || py < 0 || py >= HEIGHT) continue;
      const index = py * WIDTH + px;
      const heat = Math.max(1, fireStrength - Math.abs(dx) * 4 - Math.abs(dy) * 3);
      firePixels[index] = Math.max(firePixels[index], heat);
    }
  }
  if (!running) renderFire();
}

$("lessFire").addEventListener("click", () => setIntensity(fireStrength - 1));
$("moreFire").addEventListener("click", () => setIntensity(fireStrength + 1));
$("intensity").addEventListener("input", (event) => setIntensity(event.target.value));
$("speed").addEventListener("input", (event) => {
  speed = Number(event.target.value);
  $("speedValue").textContent = speed === 1 ? "Slow" : speed === 2 ? "Normal" : "Fast";
});
$("wind").addEventListener("input", (event) => {
  wind = Number(event.target.value);
  $("windValue").textContent = wind === 0 ? "Calm" : wind < 0 ? `${Math.abs(wind)} left` : `${wind} right`;
});
$("paletteSelect").addEventListener("change", (event) => setPalette(event.target.value));
$("embersBtn").addEventListener("click", () => {
  embersEnabled = !embersEnabled;
  $("embersBtn").classList.toggle("is-on", embersEnabled);
  $("embersBtn").setAttribute("aria-checked", String(embersEnabled));
  if (!embersEnabled) embers = [];
});
$("playBtn").addEventListener("click", () => setRunning(!running));
$("resetBtn").addEventListener("click", resetFire);
$("fullscreenBtn").addEventListener("click", async () => {
  const stage = $("stage");
  try {
    if (!document.fullscreenElement) await stage.requestFullscreen();
    else await document.exitFullscreen();
  } catch (error) {
    $("copyFeedback").textContent = "Fullscreen is not available in this browser.";
  }
});
canvas.addEventListener("pointerdown", sparkAt);

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const presets = {
      candle: { intensity: 12, speed: 1, wind: 0, palette: "classic" },
      campfire: { intensity: 28, speed: 2, wind: 0, palette: "classic" },
      wildfire: { intensity: 35, speed: 3, wind: 2, palette: "classic" }
    };
    const preset = presets[button.dataset.preset];
    setIntensity(preset.intensity);
    speed = preset.speed;
    wind = preset.wind;
    $("speed").value = String(speed);
    $("speedValue").textContent = speed === 1 ? "Slow" : speed === 2 ? "Normal" : "Fast";
    $("wind").value = String(wind);
    $("windValue").textContent = wind === 0 ? "Calm" : `${wind} right`;
    setPalette(preset.palette);
    document.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("selected", item === button));
  });
});

const codeFiles = { html: "index.html", css: "style.css", js: "script.js" };
const sourceCache = {};
let activeFile = "html";

async function loadSourceFiles() {
  const entries = Object.entries(codeFiles);
  const loaded = await Promise.all(entries.map(async ([key, filename]) => {
    const response = await fetch(filename);
    if (!response.ok) throw new Error(`Could not load ${filename}`);
    return [key, await response.text()];
  }));
  for (const [key, content] of loaded) sourceCache[key] = content;
  showSource(activeFile);
}

function showSource(file) {
  activeFile = file;
  const content = sourceCache[file] || "Source file is not available.";
  $("codeContent").textContent = content;
  $("codeFileName").textContent = codeFiles[file];
  $("codeLineCount").textContent = `${content.split("\n").length} LINES`;
  document.querySelectorAll(".file-tab").forEach((tab) => {
    const selected = tab.dataset.file === file;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
}

document.querySelectorAll(".file-tab").forEach((tab) => {
  tab.addEventListener("click", () => showSource(tab.dataset.file));
});

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    $("copyFeedback").textContent = successMessage;
  } catch (error) {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    $("copyFeedback").textContent = copied ? successMessage : "Copy failed. Select the code and copy it manually.";
  }
}

$("copyCurrentBtn").addEventListener("click", () => {
  copyText(sourceCache[activeFile] || "", `${codeFiles[activeFile]} copied to clipboard.`);
});
$("copyAllBtn").addEventListener("click", () => {
  const bundle = ["html", "css", "js"].map((key) => `/* ===== ${codeFiles[key]} ===== */\n${sourceCache[key] || ""}`).join("\n\n");
  copyText(bundle, "All three source files copied. Paste them into separate files.");
});

setIntensity(35);
createFireSource();
renderFire();
requestAnimationFrame(animate);
loadSourceFiles().catch((error) => {
  $("codeContent").textContent = "Unable to load source files. Open this page through its hosted URL, not as a local file.";
  $("codeLineCount").textContent = "SOURCE UNAVAILABLE";
  $("copyFeedback").textContent = error.message;
});
