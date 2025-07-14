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
    }
  }, 2000);
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
