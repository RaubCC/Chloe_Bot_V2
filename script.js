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
    }
    // Tooltip for step name
    div.title = stepObj.step;
    raceTrack.appendChild(div);
  });
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

// 11. Demo: advance routine step every 2 seconds
function demoProgress() {
  setTimeout(() => {
    if (completedSteps < routineSteps.length) {
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
  demoProgress(); // Remove or replace with real logic later
}

// Run the UI setup
init();
