const selector = ".task"

// Schneefall-Simulation
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '9999';
canvas.style.pointerEvents = 'none';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Partikel für Schnee
const snowflakes = [];
const groundY = canvas.height; // Position, an der sich Schnee stapeln soll

class Snowflake {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height; // Start außerhalb des Sichtfelds
    this.size = Math.random() * 2 + 1;
    this.speedY = Math.random() * 1 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.stuck = false;
    this.creationTime = Date.now();
  }

  update() {
    if (!this.stuck) {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y > canvas.height) {
        this.y = groundY - this.size;
        this.stuck = true;
        this.stuckOnGround = true;
        this.speedY = 0;
        this.speedX = 0;
      }

      if (this.x > canvas.width) {
        this.x = 0;
      } else if (this.x < 0) {
        this.x = canvas.width;
      }
    }

    // Entfernen, wenn älter als 1 Minute
    if (Date.now() - this.creationTime > 60000 * 5) {
      const index = snowflakes.indexOf(this);
      if (index > -1) {
        snowflakes.splice(index, 1);
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}

function createSnowflake() {
  snowflakes.push(new Snowflake());
}

function updateSnowflakes() {
  snowflakes.forEach((flake) => {
    flake.update();
    checkCollision(flake);
  });
}

function drawSnowflakes() {
  snowflakes.forEach((flake) => flake.draw());
}

function checkCollision(flake) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();

    if (
      flake.x > rect.left &&
      flake.x < rect.right &&
      flake.y > rect.top &&
      flake.y < rect.bottom
    ) {
      flake.stuck = true;
      flake.stuckElement = element;
      flake.speedY = 0;
      flake.speedX = 0;
      flake.y = rect.top - flake.size;
    } else if (flake.stuck && !flake.stuckOnGround && (
      flake.y < rect.top ||
      flake.x < rect.left ||
      flake.x > rect.right)) {
      flake.stuck = false;
      flake.speedY = Math.random() * 1 + 0.5;
      flake.speedX = Math.random() * 0.5 - 0.25;
    }
  });
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateSnowflakes();
  drawSnowflakes();
  requestAnimationFrame(animate);
}

// Weihnachten!
const now = new Date();
if (now.getMonth() === 11 && now.getDate() >= 1 && now.getDate() <= 26) {
    document.body.classList.add("christmas")
    // Kontinuierlich neue Schneeflocken erstellen
    setInterval(createSnowflake, 100);

    animate();
}
