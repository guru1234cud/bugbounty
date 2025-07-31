const LOCK_KEY = "sessionStartTime";
const MAX_DURATION_MIN =90 ;
const TOTAL_TIME_MS = MAX_DURATION_MIN * 60 * 1000;

// 1. Set start time once
if (!localStorage.getItem(LOCK_KEY)) {
  localStorage.setItem(LOCK_KEY, Date.now());
}

// 2. Create a visible countdown timer on screen
function createTimerDisplay() {
  const timerDiv = document.createElement("div");
  timerDiv.id = "countdown-timer";
  timerDiv.style = `
  margin-top: 50px;
    position: fixed;
    top: 10px;
    right: 10px;
    background: #222;
    color: #0f0;
    padding: 10px 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 18px;
    z-index: 9999;
  `;
  document.body.appendChild(timerDiv);
}

function updateTimerDisplay() {
  const startTime = parseInt(localStorage.getItem(LOCK_KEY));
  const now = Date.now();
  const timeLeft = Math.max(0, TOTAL_TIME_MS - (now - startTime));

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;

  const timerElement = document.getElementById("countdown-timer");
  if (timerElement) timerElement.innerText = `Time Left: ${formatted}`;

  // Lock when time runs out
  if (timeLeft <= 0) {
    lockApp();
  }
}

// 3. Lock the app
function lockApp() {
  document.body.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;
    background:#000;color:#fff;display:flex;justify-content:center;
    align-items:center;flex-direction:column;z-index:99999;">
    <h1>🔒 Session Locked</h1>
    <p>Your 90-minute session has expired.</p>
    </div>
    
    `;
  }
  
// 4. Start the countdown
window.onload = () => {
  createTimerDisplay();
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
};
function resetTimer() {
  localStorage.removeItem("sessionStartTime");
  location.reload(); // refresh page to re-initialize the timer
}
// <button onclick="resetTimer()" style="position:fixed;bottom:10px;right:10px;z-index:99999;">
//   🔄 Reset Timer (Dev)
// </button>
// button for time reset (dev)