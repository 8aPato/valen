const noButton = document.getElementById("no");
const yesButton = document.getElementById("yes");
const pleaText = document.getElementById("plea");
const bear = document.querySelector(".bear");

const pleas = [
  "para por favor 😭",
  "espera espera ESPERA",
  "no estoy listo",
  "me siento agredido",
  "¿por qué eres así?",
  "me estás asustando",
  "¿podemos hablarlo?",
  "me arrepiento de todo",
  "mis patitas no dan más 🐾",
  "¿y si lo pensamos mejor?",
  "te va a remorder la conciencia",
  "¡era broma, era broma!",
  "me voy a desmayar 💫",
  "acuérdate que sé dónde vives",
  "le voy a decir a tu mamá 😭",
  "deja de perseguirme",
  "¡no me presiones!",
  "soy un botón, tengo derechos 😤",
  "¿y si mejor le das al otro? →",
  "estoy chiquito, no me ves? 🥺",
  "mis píxeles no aguantan más",
  "te lo pido de rodillas… si tuviera 🦵",
  "¡auxilio, me persiguen! 🚨",
  "yo no pedí estar aquí 😭",
  "dale al grandote rosa, ándale",
  "un botón también tiene sentimientos",
  "¿esto cuenta como acoso a un botón?",
  "ya ni los de 'aceptar cookies' sufren tanto",
  "error 404: dignidad no encontrada",
  "Plot twist: el otro botón es mejor opción 👀",
  "técnicamente esto es bullying digital 📋",
  "me estoy quedando sin bordes a dónde huir",
  "¿te diviertes, verdad? lo sabía 😒",
  "respeta mi espacio personal (120px mínimo)",
  "el otro botón te está esperando, ve con él 💘",
  "esto no venía en mi contrato de botón",
  "MAYDAY MAYDAY botón en peligro 🆘"
];

let lastPlea = -1;
let panicLevel = 1;
let posX = 0;
let posY = 0;
let lastPleaTime = 0;
let escaped = false;

// Bear transform state (separate channels to avoid concatenation bug)
let bearCursorRotation = 0;
let bearPanicRotation = 0;
let bearPanicScale = 1;

// Interval IDs for cleanup
let shakeInterval = null;
let decayInterval = null;
let attentionInterval = null;

// Option 4: Reveal "Yes" after a delay
setTimeout(() => {
  yesButton.classList.add("revealed");
}, 2000);

// Option 3: "No" does little jumps to attract attention before any interaction
let hadInteraction = false;
attentionInterval = setInterval(() => {
  if (hadInteraction || escaped) {
    clearInterval(attentionInterval);
    return;
  }
  // Small playful bounce
  noButton.style.transition = "transform 0.15s ease";
  noButton.style.transform = "translateY(-6px) rotate(2deg)";
  setTimeout(() => {
    noButton.style.transform = "translateY(0) rotate(-1deg)";
    setTimeout(() => {
      noButton.style.transform = "";
      noButton.style.transition = "";
    }, 150);
  }, 150);
}, 2000);

function randomPlea() {
  const now = Date.now();
  if (now - lastPleaTime < 800) return;
  lastPleaTime = now;
  let i;
  do {
    i = Math.floor(Math.random() * pleas.length);
  } while (i === lastPlea);
  lastPlea = i;
  pleaText.textContent = pleas[i];
  pleaText.classList.add("visible");
  updatePleaPosition();
}

function updatePleaPosition() {
  const rect = noButton.getBoundingClientRect();
  const pleaRect = pleaText.getBoundingClientRect();

  let left = rect.left + rect.width / 2 - pleaRect.width / 2;
  let top = rect.top - pleaRect.height - 10;

  // If bubble would go above viewport, show it below the button instead
  if (top < 4) {
    top = rect.bottom + 10;
    pleaText.classList.add("below");
  } else {
    pleaText.classList.remove("below");
  }

  // Keep within horizontal bounds
  left = Math.max(4, Math.min(left, window.innerWidth - pleaRect.width - 4));

  pleaText.style.left = `${left}px`;
  pleaText.style.top = `${top}px`;
}

function updateBearTransform() {
  const rotation = bearCursorRotation + bearPanicRotation;
  bear.style.transform = `rotate(${rotation}deg) scale(${bearPanicScale})`;
}

// Switch the No button to fixed positioning so it can move across the viewport
function escapeButton() {
  if (escaped) return;
  escaped = true;

  const rect = noButton.getBoundingClientRect();
  posX = rect.left;
  posY = rect.top;

  noButton.style.position = "fixed";
  noButton.style.left = "0px";
  noButton.style.top = "0px";
  noButton.style.right = "auto";
  noButton.style.zIndex = "1000";
  noButton.style.transform = `translate(${posX}px, ${posY}px)`;
}

function moveNoButton(e) {
  hadInteraction = true;
  escapeButton();
  panicLevel = Math.min(panicLevel + 0.15, 6);
  randomPlea();

  const rect = noButton.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = centerX - e.clientX;
  const dy = centerY - e.clientY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const force = 10 * panicLevel;

  posX += (dx / distance) * force;
  posY += (dy / distance) * force;

  // Bounce against window edges
  posX = Math.max(0, Math.min(posX, window.innerWidth - rect.width));
  posY = Math.max(0, Math.min(posY, window.innerHeight - rect.height));

  noButton.style.transform =
    `translate(${posX}px, ${posY}px) rotate(${panicLevel * 2}deg)`;

  // Yes button grows with panic (overrides heartbeat animation)
  yesButton.style.animation = "none";
  yesButton.style.transform = `scale(${1 + panicLevel * 0.12})`;

  // Bear enters panic
  bearPanicRotation = (Math.random() - 0.5) * panicLevel * 4;
  bearPanicScale = 1 + panicLevel * 0.05;
  updateBearTransform();

  updatePleaPosition();
}

// Movement on button
noButton.addEventListener("mousemove", moveNoButton);

// Panic zone: trigger movement when cursor is near the No button
document.addEventListener("mousemove", (e) => {
  const rect = noButton.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - e.clientX;
  const dy = rect.top + rect.height / 2 - e.clientY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 120) {
    moveNoButton(e);
  }

  // Bear follows cursor
  const windowCenterX = window.innerWidth / 2;
  const offset = (e.clientX - windowCenterX) / windowCenterX;
  bearCursorRotation = offset * 2;
  updateBearTransform();
});

// Panic decay: gradually calm down when the cursor moves away
decayInterval = setInterval(() => {
  if (panicLevel > 1) {
    panicLevel = Math.max(1, panicLevel - 0.05);
    bearPanicRotation *= 0.92;
    bearPanicScale = 1 + (bearPanicScale - 1) * 0.92;
    updateBearTransform();
  }
  if (panicLevel <= 1.1) {
    pleaText.textContent = "";
    pleaText.classList.remove("visible");
    bearPanicRotation = 0;
    bearPanicScale = 1;
    // Restore heartbeat animation on Yes button
    yesButton.style.animation = "";
    yesButton.style.transform = "";
  }
}, 100);

// Constant shake
shakeInterval = setInterval(() => {
  const shake = panicLevel * 0.6;
  const shakeX = (Math.random() - 0.5) * shake;
  const shakeY = (Math.random() - 0.5) * shake;

  if (escaped) {
    noButton.style.transform =
      `translate(${posX + shakeX}px, ${posY + shakeY}px) rotate(${panicLevel * 2}deg)`;
    if (pleaText.classList.contains("visible")) {
      updatePleaPosition();
    }
  } else {
    noButton.style.marginLeft = `${shakeX}px`;
    noButton.style.marginTop = `${shakeY}px`;
  }
}, 70);

// Happy ending
yesButton.addEventListener("click", () => {
  clearInterval(shakeInterval);
  clearInterval(decayInterval);
  document.body.innerHTML = `
    <div style="
      height:100vh;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      background:#f7c7d9;
      font-family:sans-serif;
      text-align:center;
    ">
      <img src="yo2.png" class="excited" style="width:150px;margin-bottom:20px;">
      <style>
        @keyframes excited {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          15% { transform: translateY(-12px) rotate(-5deg); }
          30% { transform: translateY(0) rotate(3deg); }
          45% { transform: translateY(-8px) rotate(-3deg); }
          60% { transform: translateY(0) rotate(5deg); }
          75% { transform: translateY(-5px) rotate(-2deg); }
        }
        .excited { animation: excited 0.8s ease-in-out infinite; }
      </style>
      <h1>Buenísimo! 💖</h1>
      <p>Paso por ti el 14 a las 19:30</p>
    </div>
  `;
});
