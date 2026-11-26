const canvas = document.getElementById("fireCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 80;
const HEIGHT = 60;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const firePixels = new Array(WIDTH * HEIGHT).fill(0);

const palette = [
  "#070707",
  "#1f0707",
  "#2f0f07",
  "#470f07",
  "#571707",
  "#671f07",
  "#771f07",
  "#8f2707",
  "#9f2f07",
  "#af3f07",
  "#bf4707",
  "#c74707",
  "#df4f07",
  "#df5707",
  "#df5707",
  "#d75f07",
  "#d7670f",
  "#cf6f0f",
  "#cf770f",
  "#cf7f0f",
  "#cf8717",
  "#c78717",
  "#c78f17",
  "#c7971f",
  "#bf9f1f",
  "#bf9f1f",
  "#bfa727",
  "#bfa727",
  "#bfaf2f",
  "#b7af2f",
  "#b7b72f",
  "#b7b737",
  "#cfcf6f",
  "#dfdf9f",
  "#efefc7",
  "#ffffff"
];

let fireStrength = palette.length - 1;
let animationTime = 0;

// Keep the original pixel-fire source, while gently breathing its intensity.
function createFireSource() {
  const breathing = 0.5 + 0.5 * Math.sin(animationTime * 0.018);
  fireStrength = Math.round(27 + breathing * 8);

  for (let x = 0; x < WIDTH; x++) {
    const flicker = Math.random() < 0.12 ? 1 : 0;
    firePixels[(HEIGHT - 1) * WIDTH + x] = Math.min(
      palette.length - 1,
      fireStrength + flicker
    );
  }
}

function updateFire() {
  animationTime++;
  createFireSource();

  for (let y = 1; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const src = y * WIDTH + x;
      const decay = Math.floor(Math.random() * 3);
      let dst = src - WIDTH - decay;

      if (dst < 0) continue;

      firePixels[dst] = Math.max(
        firePixels[src] - decay,
        0
      );
    }
  }
}

function renderFire() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const color = palette[firePixels[y * WIDTH + x]];
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function animate() {
  updateFire();
  renderFire();
  requestAnimationFrame(animate);
}

createFireSource();
animate();