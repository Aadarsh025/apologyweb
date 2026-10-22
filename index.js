const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");
const heartLayer = document.getElementById("heartLayer");

let toastTimer;

// Show a small notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");

  menuToggle.textContent = open ? "✕" : "☰";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
});

// Close menu when a link is clicked
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight the current navigation section
const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-link");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navItems.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// Dark / light theme toggle
themeToggle.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark-theme");

  themeToggle.textContent = dark ? "☀" : "☾";
  themeToggle.setAttribute(
    "aria-label",
    dark ? "Switch to light theme" : "Switch to dark theme"
  );
});

// Copy text helper
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement("textarea");

      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";

      document.body.appendChild(area);
      area.select();

      const success = document.execCommand("copy");
      area.remove();

      if (!success) throw new Error("Copy unavailable");
    }

    showToast("Copied with love 💙");
    return true;
  } catch (error) {
    showToast("Copy failed. Please select the text manually.");
    return false;
  }
}

// Copy one quote
document.querySelectorAll(".copy-quote").forEach((button) => {
  button.addEventListener("click", async () => {
    const quote = button
      .closest(".quote-card")
      .querySelector("p")
      .textContent.trim();

    await copyText(quote);
  });
});

// Copy all quotes
document.getElementById("copyAllQuotes").addEventListener("click", async () => {
  const quotes = [...document.querySelectorAll(".quote-card p")]
    .map((quote) => quote.textContent.trim())
    .join("\n\n");

  await copyText(quotes);
});

// Select a song and update the featured player
// The buttons select songs and open a listening link;
// they do not stream audio directly.
const featuredTitle = document.getElementById("featuredTitle");
const featuredArtist = document.getElementById("featuredArtist");
const featuredLink = document.getElementById("featuredLink");
const songCards = document.querySelectorAll(".song-card");

function selectSong(card) {
  songCards.forEach((item) => {
    item.classList.remove("selected");

    const button = item.querySelector(".song-select");
    button.textContent = "▶";
  });

  card.classList.add("selected");
  card.querySelector(".song-select").textContent = "✓";

  featuredTitle.textContent = card.dataset.title;
  featuredArtist.textContent = card.dataset.artist;
  featuredLink.href = card.dataset.url;

  showToast(`Selected: ${card.dataset.title} ♫`);
}

songCards.forEach((card) => {
  card.querySelector(".song-select").addEventListener("click", () => {
    selectSong(card);
  });

  // Clicking a song card also selects it.
  card.addEventListener("click", (event) => {
    if (event.target.closest(".song-select")) return;
    selectSong(card);
  });
});

// Open the selected song's listening page
featuredLink.addEventListener("click", () => {
  // The normal anchor link handles opening the destination.
  showToast("Opening your song ♫");
});

// ------------------------------------------------------------
// "Can we try it??" button
// Shows the thank-you message to the visitor and SILENTLY
// sends you a WhatsApp notification in the background.
// No toast, no error, no retry button: the visitor sees nothing.
// ------------------------------------------------------------
const surpriseBtn = document.getElementById("surpriseBtn");
const surpriseMessage = document.getElementById("surpriseMessage");

function silentNotify() {
  // Send only once per browser so repeat visits/clicks don't spam you.
  try {
    if (localStorage.getItem("notified")) return;
  } catch (e) {
    // localStorage blocked: just continue and send
  }

  fetch("/api/send-whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "lets_be_friends_again_clicked" }),
    keepalive: true
  })
    .then((r) => r.json())
    .then((result) => {
      if (result && result.success) {
        try {
          localStorage.setItem("notified", "1");
        } catch (e) {}
      }
    })
    .catch(() => {
      // Fail silently. Check your server logs if nothing arrives.
    });
}

surpriseBtn.addEventListener("click", () => {
  if (surpriseBtn.disabled) return;

  surpriseBtn.disabled = true;
  surpriseBtn.textContent = "Thank you for reading ♡";

  surpriseMessage.hidden = false;
  surpriseMessage.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

  createHearts(18);
  silentNotify();
});

// Floating heart animations
function createHearts(count = 1) {
  const symbols = ["♡", "♥", "💙"];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");

    heart.className = "floating-heart";
    heart.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 17}px`;
    heart.style.animationDuration = `${4 + Math.random() * 3}s`;
    heart.style.animationDelay = `${Math.random() * 0.8}s`;

    heartLayer.appendChild(heart);

    heart.addEventListener("animationend", () => {
      heart.remove();
    });
  }
}

// Initial floating hearts and occasional extras
createHearts(7);

setInterval(() => {
  if (!document.hidden) {
    createHearts(2);
  }
}, 4000);

console.log("Sorry, Friend 💙 — made with sincerity.");
