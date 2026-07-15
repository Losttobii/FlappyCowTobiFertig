const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const finalBestEl = document.getElementById("finalBest");

let running = false;
let score = 0;
let frames = 0;
let buildings = [];
let clouds = [];

let best = Number(localStorage.getItem("flappyCowBest")) || 0;
bestEl.textContent = best;

const cow = {
  x: 120,
  y: 240,
  width: 64,
  height: 48,
  velocity: 0,
  gravity: 0.55,
  jump: -10
};

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext;

function sound(frequency, duration, type = "sine") {
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.12, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function createClouds() {
  clouds = Array.from({ length: 7 }, () => ({
    x: Math.random() * window.innerWidth,
    y: 40 + Math.random() * window.innerHeight * 0.45,
    size: 25 + Math.random() * 40,
    speed: 0.2 + Math.random() * 0.45
  }));
}

function updateClouds() {
  for (const cloud of clouds) {
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.size * 3 < 0) {
      cloud.x = window.innerWidth + cloud.size;
      cloud.y = 40 + Math.random() * window.innerHeight * 0.45;
    }
  }
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (const cloud of clouds) {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.size, cloud.y - cloud.size * 0.25, cloud.size * 0.75, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.size * 1.8, cloud.y, cloud.size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#71cef9");
  gradient.addColorStop(1, "#d9f5ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  updateClouds();
  drawClouds();

  ctx.fillStyle = "#5ab746";
  ctx.fillRect(0, window.innerHeight - 82, window.innerWidth, 82);

  ctx.fillStyle = "#555";
  ctx.fillRect(0, window.innerHeight - 56, window.innerWidth, 56);

  ctx.fillStyle = "#f6dd4b";
  for (let x = 0; x < window.innerWidth; x += 95) {
    ctx.fillRect(x, window.innerHeight - 31, 48, 5);
  }
}

function roundedRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCow() {
  ctx.save();

  const rotation = Math.max(-0.35, Math.min(0.55, cow.velocity * 0.035));
  ctx.translate(cow.x + cow.width / 2, cow.y + cow.height / 2);
  ctx.rotate(rotation);
  ctx.translate(-cow.width / 2, -cow.height / 2);

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#202020";
  ctx.lineWidth = 3;

  roundedRect(4, 8, 48, 32, 12);
  ctx.fill();
  ctx.stroke();

  roundedRect(41, 11, 22, 24, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#202020";
  ctx.beginPath();
  ctx.ellipse(20, 18, 8, 7, 0.3, 0, Math.PI * 2);
  ctx.ellipse(37, 31, 7, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffb8c9";
  roundedRect(45, 23, 16, 10, 5);
  ctx.fill();

  ctx.fillStyle = "#202020";
  ctx.beginPath();
  ctx.arc(50, 28, 1.5, 0, Math.PI * 2);
  ctx.arc(56, 28, 1.5, 0, Math.PI * 2);
  ctx.arc(54, 17, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8c878";
  ctx.beginPath();
  ctx.moveTo(44, 11);
  ctx.lineTo(42, 2);
  ctx.lineTo(49, 10);
  ctx.moveTo(57, 11);
  ctx.lineTo(61, 3);
  ctx.lineTo(61, 13);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(12, 37, 7, 10);
  ctx.fillRect(38, 37, 7, 10);
  ctx.fillStyle = "#202020";
  ctx.fillRect(12, 44, 7, 4);
  ctx.fillRect(38, 44, 7, 4);

  ctx.strokeStyle = "#202020";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(5, 18);
  ctx.quadraticCurveTo(-8, 10, -3, 3);
  ctx.stroke();

  ctx.restore();
}

function createBuilding() {
  const gap = Math.max(175, Math.min(240, window.innerHeight * 0.29));
  const width = Math.max(82, Math.min(110, window.innerWidth * 0.09));
  const minTop = 55;
  const maxTop = Math.max(minTop + 30, window.innerHeight - gap - 145);
  const top = minTop + Math.random() * (maxTop - minTop);

  buildings.push({
    x: window.innerWidth + 20,
    width,
    top,
    bottom: top + gap,
    passed: false
  });
}

function updateBuildings() {
  if (frames % 115 === 0) createBuilding();

  for (const building of buildings) {
    building.x -= 4;
  }

  buildings = buildings.filter(
    building => building.x + building.width > -5
  );
}

function drawBuildings() {
  for (const building of buildings) {
    ctx.fillStyle = "#6c7380";
    ctx.fillRect(building.x, 0, building.width, building.top);
    ctx.fillRect(
      building.x,
      building.bottom,
      building.width,
      window.innerHeight - building.bottom - 82
    );

    ctx.fillStyle = "#ffe45e";

    for (let y = 18; y < building.top - 10; y += 34) {
      for (let x = 10; x < building.width - 10; x += 22) {
        ctx.fillRect(building.x + x, y, 10, 15);
      }
    }

    for (let y = building.bottom + 18; y < window.innerHeight - 100; y += 34) {
      for (let x = 10; x < building.width - 10; x += 22) {
        ctx.fillRect(building.x + x, y, 10, 15);
      }
    }
  }
}

function updateScore() {
  for (const building of buildings) {
    if (!building.passed && building.x + building.width < cow.x) {
      building.passed = true;
      score++;
      sound(850, 0.16);

      if (score > best) {
        best = score;
        localStorage.setItem("flappyCowBest", String(best));
        bestEl.textContent = best;
      }
    }
  }
}

function drawScore() {
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.fillStyle = "#fff";
  ctx.strokeText(score, window.innerWidth / 2, 70);
  ctx.fillText(score, window.innerWidth / 2, 70);
}

function checkCollision() {
  if (cow.y < 0 || cow.y + cow.height > window.innerHeight - 82) {
    endGame();
    return;
  }

  for (const building of buildings) {
    const hitX =
      cow.x + cow.width > building.x &&
      cow.x < building.x + building.width;

    const hitY =
      cow.y < building.top ||
      cow.y + cow.height > building.bottom;

    if (hitX && hitY) {
      endGame();
      return;
    }
  }
}

function jump() {
  if (!running) return;
  cow.velocity = cow.jump;
  sound(450, 0.11, "square");
}

function resetGame() {
  score = 0;
  frames = 0;
  buildings = [];
  cow.y = Math.min(250, window.innerHeight / 2);
  cow.velocity = 0;
  createClouds();
}

function startGame() {
  menu.style.display = "none";
  gameOver.style.display = "none";
  canvas.style.display = "block";
  resetGame();
  running = true;
  requestAnimationFrame(loop);
}

function endGame() {
  if (!running) return;
  running = false;
  sound(180, 0.45, "sawtooth");
  scoreEl.textContent = score;
  finalBestEl.textContent = best;
  gameOver.style.display = "block";
}

function showMenu() {
  running = false;
  canvas.style.display = "none";
  gameOver.style.display = "none";
  menu.style.display = "flex";
  bestEl.textContent = best;
}

function loop() {
  if (!running) return;

  frames++;
  cow.velocity += cow.gravity;
  cow.y += cow.velocity;

  drawBackground();
  updateBuildings();
  drawBuildings();
  updateScore();
  drawCow();
  drawScore();
  checkCollision();

  if (running) requestAnimationFrame(loop);
}

playBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
menuBtn.addEventListener("click", showMenu);

canvas.addEventListener("mousedown", jump);
canvas.addEventListener(
  "touchstart",
  event => {
    event.preventDefault();
    jump();
  },
  { passive: false }
);

window.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

createClouds();
