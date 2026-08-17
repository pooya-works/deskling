const stateTitle = document.querySelector("#stateTitle");
const stateCopy = document.querySelector("#stateCopy");
const modeLabel = document.querySelector("#modeLabel");
const statusDot = document.querySelector("#statusDot");
const deskling = document.querySelector("#deskling");
const activeMinutes = document.querySelector("#activeMinutes");
const shipCount = document.querySelector("#shipCount");
const shipButton = document.querySelector("#shipButton");
const resetButton = document.querySelector("#resetButton");
const minimizeButton = document.querySelector("#minimizeButton");
const closeButton = document.querySelector("#closeButton");

const IDLE_AFTER_MS = 20_000;
const SLEEP_AFTER_MS = 60_000;
const CELEBRATE_MS = 5_000;

const messages = {
  active: {
    title: "I am awake.",
    copy: "Keep building. I will hang out here while you make things.",
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

function setMode(nextMode) {
  if (mode === nextMode) return;

  mode = nextMode;
  const message = messages[mode];
  modeLabel.textContent = mode;
  stateTitle.textContent = message.title;
  stateCopy.textContent = message.copy;
  statusDot.dataset.mode = mode;
  deskling.dataset.mode = mode;
}

function recordActivity() {
  lastActivity = Date.now();
  if (mode !== "celebrate") {
    setMode("active");
  }
}

function celebrate() {
  ships += 1;
  localStorage.setItem("deskling:ships", String(ships));
  shipCount.textContent = ships;
  celebrationUntil = Date.now() + CELEBRATE_MS;
  setMode("celebrate");
}

function resetStats() {
  ships = 0;
  sessionStartedAt = Date.now();
  localStorage.setItem("deskling:ships", "0");
  shipCount.textContent = "0";
  activeMinutes.textContent = "0";
  recordActivity();
}

function tick() {
  const now = Date.now();
  const inactiveFor = now - lastActivity;
  const minutes = Math.floor((now - sessionStartedAt) / 60_000);

  activeMinutes.textContent = String(minutes);

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
resetButton.addEventListener("click", resetStats);
minimizeButton.addEventListener("click", () => window.desklingWindow.minimize());
closeButton.addEventListener("click", () => window.desklingWindow.close());

shipCount.textContent = String(ships);
setMode("active");
tick();
