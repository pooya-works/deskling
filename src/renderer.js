const stateTitle = document.querySelector("#stateTitle");
const stateCopy = document.querySelector("#stateCopy");
const modeLabel = document.querySelector("#modeLabel");
const statusDot = document.querySelector("#statusDot");
const deskling = document.querySelector("#deskling");
const activeMinutes = document.querySelector("#activeMinutes");
const shipCount = document.querySelector("#shipCount");
const grassCount = document.querySelector("#grassCount");
const growthPoints = document.querySelector("#growthPoints");
const growthBar = document.querySelector("#growthBar");
const stageLabel = document.querySelector("#stageLabel");
const gardenBed = document.querySelector("#gardenBed");
const shipButton = document.querySelector("#shipButton");
const grassButton = document.querySelector("#grassButton");
const resetButton = document.querySelector("#resetButton");
const minimizeButton = document.querySelector("#minimizeButton");
const closeButton = document.querySelector("#closeButton");

const IDLE_AFTER_MS = 20_000;
const SLEEP_AFTER_MS = 60_000;
const CELEBRATE_MS = 5_000;
const ACTIVE_GROWTH_EVERY_MS = 60_000;
const MAX_GRASS = 24;
const GROWTH_CAP = 140;

const stages = [
  { name: "egg", min: 0, title: "A quiet egg.", copy: "Work nearby and it will start to notice the rhythm." },
  { name: "cracked", min: 25, title: "Something is stirring.", copy: "The shell remembers your small bits of progress." },
  { name: "sprout", min: 65, title: "A little sprout.", copy: "The desk is starting to grow around your work." },
  { name: "deskling", min: 110, title: "Deskling is here.", copy: "It grew from your making time and tiny shipped things." },
];

const messages = {
  active: {
    title: "Growing with you.",
    copy: "Active minutes slowly warm the shell.",
  },
  idle: {
    title: "Still here.",
    copy: "A tiny pause is allowed. I will keep the desk warm.",
  },
  sleepy: {
    title: "Getting sleepy.",
    copy: "No movement for a bit. I will nap until you come back.",
  },
  celebrate: {
    title: "You shipped!",
    copy: "That counts. Small progress is still progress.",
  },
};

let lastActivity = Date.now();
let mode = "active";
let celebrationUntil = 0;
let sessionStartedAt = Date.now();
let ships = Number(localStorage.getItem("deskling:ships") || 0);
let grass = Number(localStorage.getItem("deskling:grass") || 0);
let growth = Number(localStorage.getItem("deskling:growth") || 0);
let lastGrowthAt = Date.now();

function setMode(nextMode) {
  mode = nextMode;
  const stage = getStage();
  const message = mode === "active" ? stage : messages[mode];

  modeLabel.textContent = mode;
  stateTitle.textContent = message.title;
  stateCopy.textContent = message.copy;
  statusDot.dataset.mode = mode;
  deskling.dataset.mode = mode;
}

function getStage() {
  return stages.reduce((currentStage, stage) => {
    return growth >= stage.min ? stage : currentStage;
  }, stages[0]);
}

function persistGrowth() {
  localStorage.setItem("deskling:growth", String(growth));
  localStorage.setItem("deskling:grass", String(grass));
  localStorage.setItem("deskling:ships", String(ships));
}

function renderGarden() {
  gardenBed.innerHTML = "";

  const visibleGrass = Math.min(grass, MAX_GRASS);
  for (let index = 0; index < visibleGrass; index += 1) {
    const blade = document.createElement("span");
    blade.className = "grass-blade";
    blade.style.setProperty("--lean", `${(index % 5) - 2}deg`);
    blade.style.setProperty("--height", `${11 + (index % 4) * 4}px`);
    gardenBed.appendChild(blade);
  }
}

function renderGrowth() {
  const stage = getStage();
  const nextStage = stages.find((candidate) => candidate.min > stage.min);
  const stageMax = nextStage?.min ?? GROWTH_CAP;
  const stageProgress = Math.min(1, (growth - stage.min) / (stageMax - stage.min));

  deskling.dataset.stage = stage.name;
  stageLabel.textContent = stage.name;
  growthPoints.textContent = String(growth);
  growthBar.style.width = `${Math.max(8, stageProgress * 100)}%`;
  shipCount.textContent = String(ships);
  grassCount.textContent = String(grass);
  renderGarden();

  if (mode === "active") {
    setMode("active");
  }
}

function addGrowth(points) {
  growth = Math.min(GROWTH_CAP, growth + points);
  persistGrowth();
  renderGrowth();
}

function recordActivity() {
  lastActivity = Date.now();
  if (mode !== "celebrate") {
    setMode("active");
  }
}

function celebrate() {
  ships += 1;
  addGrowth(18);
  celebrationUntil = Date.now() + CELEBRATE_MS;
  setMode("celebrate");
}

function plantGrass() {
  grass += 1;
  addGrowth(5);
  recordActivity();
}

function resetStats() {
  ships = 0;
  grass = 0;
  growth = 0;
  sessionStartedAt = Date.now();
  persistGrowth();
  renderGrowth();
  activeMinutes.textContent = "0";
  recordActivity();
}

function tick() {
  const now = Date.now();
  const inactiveFor = now - lastActivity;
  const minutes = Math.floor((now - sessionStartedAt) / 60_000);

  activeMinutes.textContent = String(minutes);

  if (inactiveFor < IDLE_AFTER_MS && now - lastGrowthAt >= ACTIVE_GROWTH_EVERY_MS) {
    lastGrowthAt = now;
    addGrowth(1);
  }

  if (now < celebrationUntil) {
    requestAnimationFrame(tick);
    return;
  }

  if (inactiveFor >= SLEEP_AFTER_MS) {
    setMode("sleepy");
  } else if (inactiveFor >= IDLE_AFTER_MS) {
    setMode("idle");
  } else {
    setMode("active");
  }

  requestAnimationFrame(tick);
}

["pointermove", "pointerdown", "keydown", "wheel"].forEach((eventName) => {
  window.addEventListener(eventName, recordActivity, { passive: true });
});

shipButton.addEventListener("click", celebrate);
grassButton.addEventListener("click", plantGrass);
resetButton.addEventListener("click", resetStats);
minimizeButton.addEventListener("click", () => window.desklingWindow.minimize());
closeButton.addEventListener("click", () => window.desklingWindow.close());

renderGrowth();
setMode("active");
tick();
