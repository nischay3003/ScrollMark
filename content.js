console.log("Bookmark extension loaded on", window.location.href);

// ---------------- Platform Detection ----------------
function detectPlatform() {
  const h = window.location.hostname;

  if (h.includes("chatgpt.com") || h.includes("openai.com")) return "ChatGPT";
  if (h.includes("claude.ai")) return "Claude";
  if (h.includes("gemini.google.com")) return "Gemini";
  if (h.includes("copilot.microsoft.com")) return "Copilot";
  if (h.includes("perplexity.ai")) return "Perplexity";
  if (h.includes("youtube.com")) return "YouTube";

  return "WEB";
}

function getChatId() {
  return window.location.pathname + window.location.search;
}

// ---------------- Scroll Detection ----------------
function isScrollable(el) {
  if (!el || el === document.body || el === document.documentElement) return false;

  const style = getComputedStyle(el);
  return (
    (style.overflowY === "auto" || style.overflowY === "scroll") &&
    el.scrollHeight > el.clientHeight + 2
  );
}

function getScrollContainer() {
  if (detectPlatform() === "ChatGPT") {
    const chatGptRoot = document.querySelector("[data-scroll-root]");
    if (chatGptRoot) return chatGptRoot;
  }

  const selectors = [
    '[data-testid="conversation-container"]',
    '[data-testid="conversation-view"]',
    '[role="main"]',
    'main',
    '.chat-scrollable',
    '.scrollable',
    '.overflow-y-auto'
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (isScrollable(el)) return el;
  }

  const scrollingElement = document.scrollingElement;
  if (scrollingElement && scrollingElement.scrollHeight > scrollingElement.clientHeight) {
    return scrollingElement;
  }

  if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.clientHeight) {
    return document.documentElement;
  }

  if (document.body && document.body.scrollHeight > document.body.clientHeight) {
    return document.body;
  }

  return scrollingElement || document.documentElement || document.body;
}

function getScrollY(container) {
  return container === document.scrollingElement ||
    container === document.documentElement ||
    container === document.body
    ? window.scrollY
    : container.scrollTop;
}

function scrollToY(container, y) {
  if (container === document.scrollingElement) {
    window.scrollTo({ top: y, behavior: "smooth" });
  } else {
    container.scrollTo({ top: y, behavior: "smooth" });
  }
}

// ---------------- Bookmark Logic ----------------
function saveBookmark() {
  const container = getScrollContainer();
  const scrollY = getScrollY(container);

  const name = prompt("Enter bookmark name:");
  if (!name) return;

  const bookmark = {
    id: Date.now(),
    name,
    scrollY,
    chatId: getChatId(),
    platform: detectPlatform(),
    url: window.location.href,
    createdAt: new Date().toLocaleString(),
  };

  chrome.storage.local.get(["bookmarks"], (data) => {
    const bookmarks = data.bookmarks || [];
    bookmarks.push(bookmark);

    chrome.storage.local.set({ bookmarks }, () => {
      // Flash the saved state for 1.5s then revert
      const btn = document.getElementById("__bm-btn__");
      if (btn) {
        btn.classList.add("bookmark-btn--saved");
        btn.setAttribute("data-tooltip", "Saved!");
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>`;
        setTimeout(() => {
          btn.classList.remove("bookmark-btn--saved");
          btn.setAttribute("data-tooltip", "Save bookmark");
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>`;
        }, 1500);
      }
    });
  });
}

// ---------------- Button ----------------
function createBookmarkButton() {
  if (document.getElementById("__bm-btn__")) return;

  const btn = document.createElement("button");
  btn.id = "__bm-btn__";
  btn.className = "bookmark-btn";
  btn.setAttribute("data-tooltip", "Save bookmark");

  // SVG bookmark icon (cleaner than emoji)
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>`;

  btn.addEventListener("click", saveBookmark);
  (document.body || document.documentElement).appendChild(btn);
}
// ---------------- Init ----------------
function init() {
  createBookmarkButton();
}

// Run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Retry for SPA
setTimeout(init, 1500);

// ---------------- Listener ----------------
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "scrollTo") {
    const container = getScrollContainer();
    scrollToY(container, message.scrollY);
  }
});