// --- Chatbot: Send requests to Worker endpoint ---
// Example Worker endpoint URL (replace with your actual endpoint)
const WORKER_ENDPOINT = "https://flat-night-6fb4.raubcc.workers.dev/api/chat";

// Get chat input and window (if present)
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatWindow = document.getElementById("chatWindow");

// Store all products globally so all functions can access
let allProducts = [];

// Track routine timer globally
let routineStartTime = 0,
  routineEndTime = 0;

// Store chat history for context-aware responses
let chatHistory = [];

// Allowed topics for follow-up questions
const allowedTopics = [
  "routine",
  "skincare",
  "haircare",
  "makeup",
  "fragrance",
  "product",
  "beauty",
  "step",
  "pit crew",
  "lap",
  "spf",
  "hydration",
  "glow",
  "serum",
  "moisturizer",
  "cleanser",
  "suncare",
  "treatment",
  "men's grooming",
];

// Send chat request to Worker and display response
async function sendChatMessage(message) {
  // Only allow questions about the routine or beauty topics
  const lowerMsg = message.toLowerCase();
  const isAllowed = allowedTopics.some((topic) => lowerMsg.includes(topic));
  if (!isAllowed && chatHistory.length > 0) {
    if (chatWindow) {
      chatWindow.innerHTML += `<div class="bot-msg error">Please ask about your routine or beauty topics (skincare, haircare, makeup, fragrance, etc.).</div>`;
    }
    return;
  }
  // Show user message
  if (chatWindow) {
    chatWindow.innerHTML += `<div class="user-msg">${message}</div>`;
  }
  // Add to chat history
  chatHistory.push({ role: "user", content: message });
  // Send to Worker endpoint with full history
  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          typeof API_KEY !== "undefined"
            ? API_KEY
            : "pmpt_6871588c60848197b75a0d59ce945e2805634bcdbbfa9b7b"
        }`,
      },
      body: JSON.stringify({
        history: chatHistory,
        message,
      }),
    });
    const data = await response.json();
    // Show bot response
    if (chatWindow && data && data.reply) {
      chatWindow.innerHTML += `<div class="bot-msg">${data.reply}</div>`;
      chatHistory.push({ role: "assistant", content: data.reply });
    }
  } catch (err) {
    if (chatWindow) {
      chatWindow.innerHTML += `<div class="bot-msg error">Sorry, the radio comms are down in the pit lane!</div>`;
    }
  }
}

// Handle chat form submit
if (userInput && sendBtn && chatWindow) {
  sendBtn.onclick = (e) => {
    e.preventDefault();
    const msg = userInput.value.trim();
    if (msg) {
      sendChatMessage(msg);
      userInput.value = "";
    }
  };
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });
}
// --- Radio Console Search & Team Radio Share ---
const productSearch = document.getElementById("product-search");
const searchBtn = document.getElementById("search-btn");
const shareBtn = document.getElementById("share-routine-btn");
const shareMsg = document.getElementById("share-message");

// let allProducts = []; // Already declared above, do not redeclare

// Filter product cards by search
function filterProducts(query) {
  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase())
  );
  renderProductCards(filtered);
}

if (productSearch && searchBtn) {
  searchBtn.onclick = () => {
    filterProducts(productSearch.value);
  };
  productSearch.onkeyup = (e) => {
    if (e.key === "Enter") filterProducts(productSearch.value);
    if (productSearch.value === "") renderProductCards(allProducts);
  };
}

// Share routine as a race report
if (shareBtn && shareMsg) {
  shareBtn.onclick = () => {
    // For demo, just share the routine steps and lap time
    let report = "🏁 Team Radio: Race Report!\n";
    report += routineSteps.map((s, i) => `Lap ${i + 1}: ${s.step}`).join("\n");
    if (
      lapTimeValue &&
      lapTimeValue.textContent &&
      lapTimeValue.textContent !== "--:--"
    ) {
      report += `\nBest Lap Time: ${lapTimeValue.textContent}`;
    }
    navigator.clipboard.writeText(report).then(() => {
      shareMsg.style.display = "block";
      setTimeout(() => {
        shareMsg.style.display = "none";
      }, 1800);
    });
  };
}
// --- Trophy & Quiz Modal Logic ---
const trophyModal = document.getElementById("trophy-modal");
const trophyCloseBtn = document.getElementById("trophy-close-btn");
const lapTimeValue = document.getElementById("lap-time-value");
const trophyPodium = document.getElementById("trophy-podium");

const quizModal = document.getElementById("quiz-modal");
const quizStartBtn = document.getElementById("quiz-start-btn");
const quizCloseBtn = document.getElementById("quiz-close-btn");
const quizRetakeBtn = document.getElementById("quiz-retake-btn");

const quizResultDiv = document.getElementById("quiz-result");
// ===============================
// Product Selection Logic
// ===============================

// Array to keep track of selected product IDs
let selectedProductIds = [];

// Render the selected products in the UI
function renderSelectedProducts() {
  const list = document.getElementById("selected-products-list");
  if (!list) return;
  list.innerHTML = "";
  if (selectedProductIds.length === 0) {
    list.innerHTML = "<li style='color:#aaa;'>No products selected yet.</li>";
    return;
  }
  // allProducts must be loaded before this runs
  selectedProductIds.forEach((id) => {
    const product =
      typeof allProducts !== "undefined" && allProducts.find
        ? allProducts.find((p) => p.id === id)
        : null;
    if (product) {
      const li = document.createElement("li");
      li.textContent = `${product.name} (${product.brand})`;
      list.appendChild(li);
    }
  });
}

// Save selected products to localStorage
function saveSelectedProductsToStorage() {
  localStorage.setItem(
    "selectedProductIds",
    JSON.stringify(selectedProductIds)
  );
}

// ===============================
// On page load, ensure selected products section is rendered
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadSelectedProductsFromStorage();
  renderSelectedProducts();
});

const quizQuestionsDiv = document.getElementById("quiz-questions");

// --- Formula Beauty Quiz Functionality ---
let quizStarted = false;
let quizCurrent = 0;
let quizAnswers = [];
let quizTeam = "";
const quizQuestions = [
  {
    q: "What’s your main skin goal?",
    a: ["Hydration", "Glow", "Recovery", "Sun Defense"],
  },
  {
    q: "Pick your race weekend weather:",
    a: ["Sunny", "Rainy", "Night", "Cloudy"],
  },
  {
    q: "Your F1 pit crew motto?",
    a: ["Keep it cool", "Shine on", "Never give up", "Protect the finish"],
  },
];

function showQuizQuestion(idx) {
  quizResultDiv.style.display = "none";
  quizRetakeBtn.style.display = "none";
  if (idx === 0) quizAnswers = [];
  quizCurrent = idx;
  if (idx >= quizQuestions.length) {
    // Quiz complete, show result
    showQuizResult();
    return;
  }
  const q = quizQuestions[idx];
  quizQuestionsDiv.innerHTML =
    `<div style='font-weight:bold;font-size:1.1em;margin-bottom:10px;'>${q.q}</div>` +
    q.a
      .map(
        (ans, i) =>
          `<button class='start-btn quiz-answer-btn' data-idx='${i}' style='margin:8px 4px 0 4px;'>${ans}</button>`
      )
      .join("");
  quizStartBtn.style.display = "none";
  // Add event listeners for answer buttons
  document.querySelectorAll(".quiz-answer-btn").forEach((btn) => {
    btn.onclick = () => {
      quizAnswers[idx] = parseInt(btn.getAttribute("data-idx"));
      showQuizQuestion(idx + 1);
    };
  });
}

function showQuizResult() {
  // Simple mapping for demo
  const teams = ["Hydration", "Glow", "Recovery", "Sun Defense"];
  quizTeam = teams[quizAnswers[0]] || "Hydration";
  let summary = `<div style='color:gold;font-weight:bold;font-size:1.15em;margin-bottom:10px;'>🏁 You’re on Team ${quizTeam}!</div>`;
  summary += `<div style='color:#fff;font-size:1em;margin-bottom:10px;'>Your answers:</div><ul style='color:#ffd6e0;text-align:left;max-width:320px;margin:0 auto 12px auto;'>`;
  quizQuestions.forEach((q, i) => {
    if (typeof quizAnswers[i] !== "undefined") {
      summary += `<li><b>${q.q}</b><br><span style='color:gold;'>${
        q.a[quizAnswers[i]]
      }</span></li>`;
    }
  });
  summary += `</ul>`;
  quizResultDiv.innerHTML = summary;
  quizResultDiv.style.display = "block";
  quizRetakeBtn.style.display = "inline-block";
  // Optionally, you could trigger a routine suggestion here
}

// Show quiz modal on page load
window.addEventListener("DOMContentLoaded", () => {
  quizModal.style.display = "flex";
  quizStartBtn.style.display = "inline-block";
  quizQuestionsDiv.innerHTML =
    "<div style='color:#fffbe7;font-size:1.1em;'>Ready to find your Formula Beauty team? Click Start!</div>";
  quizResultDiv.style.display = "none";
  quizRetakeBtn.style.display = "none";
});

if (quizStartBtn) {
  quizStartBtn.onclick = () => {
    showQuizQuestion(0);
  };
}
if (quizRetakeBtn) {
  quizRetakeBtn.onclick = () => {
    showQuizQuestion(0);
  };
}
if (quizCloseBtn) {
  quizCloseBtn.onclick = () => {
    quizModal.style.display = "none";
  };
}
// --- Racing Routine UI Script ---

// 1. Get references to main UI sections
const raceTrack = document.getElementById("race-track");
const flagAnimation = document.getElementById("flag-animation");
const speedometerNeedle = document.getElementById("speedometer-needle");
const speedometerLabel = document.getElementById("speedometer-label");
const productCards = document.getElementById("product-cards");

// 2. Define the routine steps (checkpoints)
const routineSteps = [
  { step: "Cleanser" },
  { step: "Serum" },
  { step: "Moisturizer" },
  { step: "SPF" },
];

// 3. Assign pit crew personas for product cards
const crewPersonas = {
  cleanser: "Hydration Engineer",
  serum: "Glow Specialist",
  moisturizer: "Barrier Boss",
  haircare: "Shine Mechanic",
  "hair styling": "Style Strategist",
  "hair color": "Color Captain",
  makeup: "Finish Line Artist",
  skincare: "Radiance Crew",
  suncare: "Sun Safety Chief",
  fragrance: "Aroma Ace",
  "men's grooming": "Pit Crew Pro",
};

// 4. Track which steps are complete (for demo, start with none complete)
let completedSteps = 0;
let routineStarted = false;

// Pit stop tips for each step
const pitStopTips = [
  "Need a hydration boost? Add a serum at this pit stop!",
  "Want extra glow? Try a vitamin C serum!",
  "Lock in moisture for a smooth finish!",
  "Don't forget SPF for the win!",
];

// Reference to overtake animation container
const overtakeAnimation = document.getElementById("overtake-animation");

// Start Your Engines button
const startBtn = document.getElementById("start-engines-btn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    routineStarted = true;
    completedSteps = 0;
    // Hide the button after starting
    startBtn.style.display = "none";
    // Start the routine progress
    renderRaceTrack();
    showFlag();
    updateSpeedometer();
    // Start timer for lap time
    routineStartTime = Date.now();
    demoProgress();
  });
}

// 5. Show the race track with checkpoints

function renderRaceTrack() {
  raceTrack.innerHTML = "";
  routineSteps.forEach((stepObj, idx) => {
    // Add a circle for each checkpoint
    const div = document.createElement("div");
    div.className = "checkpoint";
    div.textContent = idx + 1;
    // Style based on progress
    if (idx < completedSteps) {
      div.classList.add("complete");
    } else if (idx === completedSteps) {
      div.classList.add("active");
      // Show pit stop tip for current step
      showPitStopTip(idx, div);
    }
    // Tooltip for step name, now with Lap X: StepName
    div.title = `Lap ${idx + 1}: ${stepObj.step}`;
    // Add lap label below each checkpoint
    const lapLabel = document.createElement("div");
    lapLabel.style.fontSize = "0.95em";
    lapLabel.style.color = "gold";
    lapLabel.style.textAlign = "center";
    lapLabel.style.marginTop = "6px";
    lapLabel.textContent = `Lap ${idx + 1}: ${stepObj.step}`;
    div.appendChild(lapLabel);
    raceTrack.appendChild(div);
  });
}

// Show a quick pit stop tip above the current checkpoint
function showPitStopTip(idx, checkpointDiv) {
  // Remove any existing tip
  const oldTip = document.querySelector(".pit-stop-tip");
  if (oldTip) oldTip.remove();
  // Create tip
  const tip = document.createElement("div");
  tip.className = "pit-stop-tip";
  tip.textContent = pitStopTips[idx] || "";
  // Position tip above the checkpoint
  checkpointDiv.style.position = "relative";
  tip.style.position = "absolute";
  tip.style.left = "50%";
  tip.style.top = "-48px";
  tip.style.transform = "translateX(-50%)";
  checkpointDiv.appendChild(tip);
  // Remove tip after 2 seconds
  setTimeout(() => {
    tip.remove();
  }, 2000);
}

// 6. Show flag animation based on routine state
function showFlag() {
  let flagType = "green";
  if (completedSteps === routineSteps.length) {
    flagType = "checkered";
  } else if (hasProductConflict) {
    flagType = "yellow";
  }
  // Use emoji for flags for simplicity
  let flagEmoji = "\uD83D\uDEA9"; // Green flag
  if (flagType === "checkered") flagEmoji = "🏁";
  if (flagType === "yellow") flagEmoji = "\uD83D\uDFE1";
  flagAnimation.innerHTML = `<span class="flag" title="${flagType} flag">${flagEmoji}</span>`;
}

// 7. Update speedometer progress bar
function updateSpeedometer() {
  // Calculate percent complete
  const percent = Math.round((completedSteps / routineSteps.length) * 100);
  // Needle rotates from -90deg (0%) to +90deg (100%)
  const angle = -90 + (180 * completedSteps) / routineSteps.length;
  speedometerNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  speedometerLabel.textContent = `Routine ${percent}% built!`;
}

// 8. Load products and show pit crew cards
async function loadProducts() {
  // Fetch product data from JSON file
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
  return data.products;
}

// 9. Show product cards with crew personas
function renderProductCards(products) {
  productCards.innerHTML = "";
  products.forEach((product) => {
    // Pick persona based on category
    let persona = crewPersonas[product.category] || "Crew Member";
    // Card HTML
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="crew-persona">${persona}</div>
      <img class="product-img" src="${product.image}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.description}</div>
    `;
    productCards.appendChild(card);
  });
}

// 10. Simulate product conflict (for yellow flag demo)
let hasProductConflict = false;

// 11. Demo: advance routine step every 2 seconds (only after start)
function demoProgress() {
  if (!routineStarted) return;
  setTimeout(() => {
    if (completedSteps < routineSteps.length) {
      // Simulate an overtake if user adds a better product (step 2 for demo)
      if (completedSteps === 1) {
        showOvertakeAnimation("Glow Specialist overtakes for the lead!");
      }
      completedSteps++;
      // Simulate a conflict at step 2
      hasProductConflict = completedSteps === 2;
      renderRaceTrack();
      showFlag();
      updateSpeedometer();
      demoProgress();
    } else {
      hasProductConflict = false;
      showFlag();
      updateSpeedometer();
      // Show trophy modal and lap time
      routineEndTime = Date.now();
      showTrophyModal();
    }
  }, 2000);
}

function showTrophyModal() {
  if (!trophyModal) return;
  // Calculate lap time in seconds
  let lapTime = ((routineEndTime - routineStartTime) / 1000).toFixed(1);
  lapTimeValue.textContent = `${lapTime}s`;
  trophyPodium.innerHTML = `🏆<br><span style='font-size:0.6em;color:#ff003b;'>Pole Position!</span>`;
  trophyModal.style.display = "flex";
}

if (trophyCloseBtn) {
  trophyCloseBtn.onclick = () => {
    trophyModal.style.display = "none";
  };
}

// Show overtake animation (mini pop-up)
function showOvertakeAnimation(message) {
  if (!overtakeAnimation) return;
  overtakeAnimation.innerHTML = `<span class="overtake-effect">${message}</span>`;
  // Remove after animation
  setTimeout(() => {
    overtakeAnimation.innerHTML = "";
  }, 1100);
}

// 12. Initialize UI
async function init() {
  renderRaceTrack();
  showFlag();
  updateSpeedometer();
  const products = await loadProducts();
  // For demo, show only a few products (one per main step)
  const mainCategories = ["cleanser", "skincare", "moisturizer", "suncare"];
  const pitCrewProducts = mainCategories
    .map((cat) => products.find((p) => p.category === cat))
    .filter(Boolean);
  renderProductCards(pitCrewProducts);
  // Wait for user to start engines
}

// Run the UI setup
init();
