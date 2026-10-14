const envelope = document.getElementById("envelope");
const proposal = document.getElementById("proposal");
const popup = document.getElementById("popup");
const buttonStage = document.getElementById("buttonStage");
const noButton = document.getElementById("no");
const yesButton = document.getElementById("yes");
const birthday = document.getElementById("birthday");
const intro = document.getElementById("intro");
const wishButton = document.getElementById("wishButton");
const replayButton = document.getElementById("replay");
const toast = document.getElementById("toast");

let home = { left: 0, top: 0 };
let returnTimer = null;
let toastTimer = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// NO button coordinates are measured only inside buttonStage, so it can never
// leave the popup or get clipped by the page.
function setHomePosition() {
  const stageRect = buttonStage.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const noWidth = noButton.offsetWidth;
  const noHeight = noButton.offsetHeight;

  let left = yesRect.right - stageRect.left + 12;
  if (left + noWidth > buttonStage.clientWidth - 5) {
    left = yesRect.left - stageRect.left - noWidth - 12;
  }
  left = clamp(left, 4, Math.max(4, buttonStage.clientWidth - noWidth - 4));
  const top = clamp((buttonStage.clientHeight - noHeight) / 2, 2, buttonStage.clientHeight - noHeight - 2);

  home = { left, top };
  noButton.style.left = `${home.left}px`;
  noButton.style.top = `${home.top}px`;
}

function returnNoHome() {
  noButton.classList.remove("dodging");
  noButton.style.transition = "left .35s ease, top .35s ease";
  noButton.style.left = `${home.left}px`;
  noButton.style.top = `${home.top}px`;
  window.setTimeout(() => {
    noButton.style.transition = "left .12s ease, top .12s ease";
  }, 380);
}

function moveNoButton() {
  if (proposal.classList.contains("hidden")) return;
  const maxLeft = Math.max(4, buttonStage.clientWidth - noButton.offsetWidth - 4);
  const maxTop = Math.max(2, buttonStage.clientHeight - noButton.offsetHeight - 2);

  let nextLeft = Math.random() * maxLeft;
  let nextTop = Math.random() * maxTop;

  // Avoid staying too close to its current position.
  const currentLeft = parseFloat(noButton.style.left) || home.left;
  const currentTop = parseFloat(noButton.style.top) || home.top;
  if (Math.abs(nextLeft - currentLeft) < 45 && Math.abs(nextTop - currentTop) < 18) {
    nextLeft = clamp(nextLeft + (nextLeft < maxLeft / 2 ? 70 : -70), 4, maxLeft);
    nextTop = clamp(nextTop + (nextTop < maxTop / 2 ? 18 : -18), 2, maxTop);
  }

  noButton.style.transition = "left .12s ease, top .12s ease";
  noButton.style.left = `${nextLeft}px`;
  noButton.style.top = `${nextTop}px`;

  // Always bring NO back to its exact starting spot after a short pause.
  window.clearTimeout(returnTimer);
  returnTimer = window.setTimeout(returnNoHome, 1300);
}

envelope.addEventListener("click", () => {
  envelope.classList.add("open");
  window.setTimeout(() => {
    proposal.classList.remove("hidden");
    window.requestAnimationFrame(setHomePosition);
  }, 450);
});

// Pointer events cover mouse, pen, and touch. Moving the button does not cancel
// its reset timer, so it always returns to its starting position.
noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
});
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesButton.addEventListener("click", () => {
  window.clearTimeout(returnTimer);
  proposal.classList.add("hidden");
  intro.classList.add("hidden");
  birthday.classList.remove("hidden");
  burstConfetti(100);
});

function burstConfetti(amount = 55) {
  const colors = ["#ff4f91", "#ff9cc5", "#ffd36e", "#fff0f6", "#c76cff"];
  for (let i = 0; i < amount; i++) {
    const bit = document.createElement("span");
    bit.className = "confetti";
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.animationDelay = `${Math.random() * .7}s`;
    bit.style.animationDuration = `${2.2 + Math.random() * 2}s`;
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 5000);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2400);
}

wishButton.addEventListener("click", () => {
  document.querySelector(".flame").style.display = "none";
  showToast("Wish made with love! May it come true. 💗");
  burstConfetti(35);
});

replayButton.addEventListener("click", () => {
  birthday.classList.add("hidden");
  intro.classList.remove("hidden");
  envelope.classList.remove("open");
  wishButton.closest(".birthday").querySelector(".flame").style.display = "";
  showToast("Surprise reset — tap the envelope! 💌");
});

window.addEventListener("resize", () => {
  if (!proposal.classList.contains("hidden")) setHomePosition();
});
