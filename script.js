// --- Chatbot: Send requests to Worker endpoint ---
// Example Worker endpoint URL (replace with your actual endpoint)
const WORKER_ENDPOINT = "https://flat-night-6fb4.raubcc.workers.dev/api/chat";

// Get chat input and window (if present)
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatWindow = document.getElementById("chatWindow");

// Send chat request to Worker and display response
async function sendChatMessage(message) {
  // Show user message
  if (chatWindow) {
    chatWindow.innerHTML += `<div class="user-msg">${message}</div>`;
  }
  // Send to Worker endpoint
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
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    // Show bot response
    if (chatWindow && data && data.reply) {
      chatWindow.innerHTML += `<div class="bot-msg">${data.reply}</div>`;
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
// ===============================
// Product Selection Logic
// ===============================

// Array to keep track of selected product IDs
let selectedProductIds = [];

// Store all products for lookup
let allProducts = [];

// Helper: Render the selected products list
function renderSelectedProducts() {
  const list = document.getElementById("selected-products-list");
  list.innerHTML = "";
  if (selectedProductIds.length === 0) {
    list.innerHTML =
      '<li style="color:#888;font-size:0.98em;">No products selected yet.</li>';
    return;
  }
  selectedProductIds.forEach((id) => {
    const product = allProducts.find((p) => p.id === id);
    if (product) {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.marginBottom = "6px";
      li.innerHTML = `
        <span style="flex:1;">${product.name}</span>
        <button class="remove-selected-btn" data-id="${id}" style="background:#ff003b;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:1em;line-height:1;">&times;</button>
      `;
      list.appendChild(li);
    }
  });
  // Add event listeners for remove buttons
  list.querySelectorAll(".remove-selected-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      toggleProductSelection(id);
    });
  });
}

// Helper: Toggle product selection by ID
function toggleProductSelection(productId) {
  const idx = selectedProductIds.indexOf(productId);
  if (idx === -1) {
    selectedProductIds.push(productId);
  } else {
    selectedProductIds.splice(idx, 1);
  }
  renderSelectedProducts();
  updateProductCardHighlights();
}

// Helper: Visually highlight selected product cards
function updateProductCardHighlights() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const id = card.getAttribute("data-id");
    if (selectedProductIds.includes(id)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

// ===============================
// Product Card Rendering (with selection)
// ===============================

// Save the original renderProductCards if it exists
const originalRenderProductCards =
  typeof renderProductCards === "function" ? renderProductCards : null;

// Render product cards and enable selection
function renderProductCards(products) {
  allProducts = products;
  const container = document.getElementById("product-cards");
  container.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", product.id);
    card.style.cursor = "pointer";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" style="width:60px;height:60px;object-fit:cover;border-radius:12px;box-shadow:0 2px 8px #0002;">
      <div style="margin-top:8px;font-weight:bold;">${product.name}</div>
      <div style="font-size:0.95em;color:#555;">${product.category}</div>
    `;
    // Highlight if selected
    if (selectedProductIds.includes(product.id)) {
      card.classList.add("selected");
    }
    // Click to select/unselect
    card.addEventListener("click", () => {
      toggleProductSelection(product.id);
    });
    container.appendChild(card);
  });
  updateProductCardHighlights();
}

// ===============================
// On page load, ensure selected products section is rendered
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  renderSelectedProducts();
});

const quizQuestionsDiv = document.getElementById("quiz-questions");

let quizStarted = false;
let quizTeam = "";
let quizStartTime = 0;
let routineStartTime = 0;
let routineEndTime = 0;

// Simple quiz questions and answers
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
let quizAnswers = [];

// Show quiz modal on page load
window.addEventListener("DOMContentLoaded", () => {
  quizModal.style.display = "flex";
  showQuizQuestion(0);
});

function showQuizQuestion(idx) {
  if (idx >= quizQuestions.length) {
    // Quiz complete, pick a team
    quizTeam = pickQuizTeam();
    quizQuestionsDiv.innerHTML = `<div style='color:#ff003b;font-weight:bold;'>You’re on Team ${quizTeam}!</div>`;
    // Add Generate Routine button
    quizQuestionsDiv.innerHTML += `<button id='generate-routine-btn' class='start-btn' style='margin-top:18px;'>Generate Routine</button>`;
    quizStartBtn.style.display = "none";
    // Add event listener after rendering
    setTimeout(() => {
      const genBtn = document.getElementById("generate-routine-btn");
      if (genBtn) {
        genBtn.onclick = async () => {
          // Collect selected products (for demo, use pitCrewProducts or all main routine steps)
          // In a real app, you would let users select products. Here, we use the main routine demo products.
          const products = allProducts.length
            ? allProducts
            : await loadProducts();
          const mainCategories = [
            "cleanser",
            "skincare",
            "moisturizer",
            "suncare",
          ];
          const selectedProducts = mainCategories
            .map((cat) => products.find((p) => p.category === cat))
            .filter(Boolean)
            .map((p) => ({
              name: p.name,
              brand: p.brand,
              category: p.category,
              description: p.description,
            }));
          // Send to OpenAI/Worker endpoint for routine generation
          if (selectedProducts.length && chatWindow) {
            chatWindow.innerHTML += `<div class="user-msg">Generate a personalized routine for me using these products:</div>`;
            chatWindow.innerHTML += `<div class="user-msg" style="font-size:0.95em;background:#fffbe7;color:#222;">${selectedProducts
              .map((p) => `<b>${p.name}</b> (${p.brand})`)
              .join(", ")}</div>`;
            // Call Worker endpoint
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
                  products: selectedProducts,
                  message:
                    "Generate a personalized skincare routine using only these products.",
                }),
              });
              const data = await response.json();
              if (data && data.reply) {
                chatWindow.innerHTML += `<div class="bot-msg">${data.reply}</div>`;
              } else {
                chatWindow.innerHTML += `<div class="bot-msg error">Sorry, the pit crew couldn't generate your routine.</div>`;
              }
            } catch (err) {
              chatWindow.innerHTML += `<div class="bot-msg error">Sorry, the radio comms are down in the pit lane!</div>`;
            }
          }
        };
      }
    }, 100);
    return;
  }
  const q = quizQuestions[idx];
  quizQuestionsDiv.innerHTML =
    `<div>${q.q}</div>` +
    q.a
      .map(
        (ans, i) =>
          `<button class='start-btn' style='margin:8px 4px 0 4px;' onclick='window.selectQuizAnswer(${idx},${i})'>${ans}</button>`
      )
      .join("");
  quizStartBtn.style.display = "none";
}

// Expose for inline onclick
window.selectQuizAnswer = function (idx, ansIdx) {
  quizAnswers[idx] = ansIdx;
  showQuizQuestion(idx + 1);
};

function pickQuizTeam() {
  // Simple mapping for demo
  const teams = ["Hydration", "Glow", "Recovery", "Sun Defense"];
  // Use first answer or random
  return teams[quizAnswers[0]] || "Hydration";
}

if (quizCloseBtn) {
  quizCloseBtn.onclick = () => {
    quizModal.style.display = "none";
  };
}

if (quizStartBtn) {
  quizStartBtn.onclick = () => {
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
