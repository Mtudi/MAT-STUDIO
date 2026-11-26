const canvas = document.getElementById("fireCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 80;
const HEIGHT = 60;
const SCALE = 8;

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

// Create the fire source (bottom row)
function createFireSource() {
  for (let x = 0; x < WIDTH; x++) {
    firePixels[(HEIGHT - 1) * WIDTH + x] = fireStrength;
  }
}

createFireSource();

document.getElementById("moreFire").onclick = () => {
  fireStrength = Math.min(palette.length - 1, fireStrength + 1);
  createFireSource();
};

document.getElementById("lessFire").onclick = () => {
  fireStrength = Math.max(0, fireStrength - 1);
  createFireSource();
};
function updateFire() {
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

animate();