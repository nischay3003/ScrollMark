// console.log("Content script loaded on", window.location.href);

// // Detect platform/service
// function detectPlatform() {
//   const hostname = window.location.hostname;
  
//   if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) return 'ChatGPT';
//   if (hostname.includes('claude.ai')) return 'Claude';
//   if (hostname.includes('gemini.google.com')) return 'Gemini';
//   if (hostname.includes('copilot.microsoft.com')) return 'Copilot';
//   if (hostname.includes('perplexity.ai')) return 'Perplexity';
//   if (hostname.includes('huggingface.co')) return 'HuggingFace';
//   if (hostname.includes('deepseek.com')) return 'DeepSeek';
//   if (hostname.includes('groq.com')) return 'Groq';
  
//   // Default to domain name for general websites
//   return hostname.split('.')[0].toUpperCase();
// }

// function getChatId() {
//   return window.location.pathname + window.location.search;
// }

// // Get scroll container - works across different platforms
// function getScrollContainer() {
//   const selectors = [
//     '[data-scroll-root]',
//     '[data-testid="conversation-container"]',
//     '[data-testid="conversation-view"]',
//     '[role="main"]',
//     'main',
//     '.chat-scrollable',
//     '.scrollable',
//     '.overflow-y-auto'
//   ];

//   for (const selector of selectors) {
//     const el = document.querySelector(selector);
//     if (el && el.scrollHeight > el.clientHeight) {
//       return el;
//     }
//   }

//   const scrollingElement = document.scrollingElement;
//   if (scrollingElement && scrollingElement.scrollHeight > scrollingElement.clientHeight) {
//     return scrollingElement;
//   }

//   if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.clientHeight) {
//     return document.documentElement;
//   }

//   if (document.body && document.body.scrollHeight > document.body.clientHeight) {
//     return document.body;
//   }

//   return scrollingElement || document.documentElement || document.body;
// }

// function getScrollY(container) {
//   if (!container) return 0;

//   const pageScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
//   const isPageRoot = container === document.scrollingElement || container === document.documentElement || container === document.body || container.nodeName === 'HTML' || container.nodeName === 'BODY';

//   return isPageRoot ? pageScrollY : container.scrollTop || 0;
// }

// function saveBookmark() {
//   const container = getScrollContainer();

//   if (!container) {
//     console.log("Scroll container not found");
//     return;
//   }

//   const scrollY = getScrollY(container);
//   const name = prompt("Enter bookmark name:");

//   if (!name || name.trim() === "") {
//     console.log("Bookmark name not provided");
//     return;
//   }

//   console.log("Saving scroll:", scrollY);

//   const bookmark = {
//     id: Date.now(),
//     name: name.trim(),
//     scrollY: scrollY,
//     chatId: getChatId(),
//     platform: detectPlatform(),
//     url: window.location.href,
//     createdAt: new Date().toLocaleString()
//   };

//   chrome.storage.local.get(["bookmarks"], (data) => {
//     const bookmarks = data.bookmarks || [];
//     bookmarks.push(bookmark);

//     chrome.storage.local.set({ bookmarks }, () => {
//       alert("Bookmark saved!");
//     });
//   });
// }

// // 🔘 Floating button - Create with robust DOM handling
// function createBookmarkButton() {
//   try {
//     const btn = document.createElement("button");
//     btn.innerText = "📌";
//     btn.className = "bookmark-btn";
//     btn.title = "Create a bookmark for this position";
//     btn.onclick = saveBookmark;
    
//     // Try to append to body first
//     if (document.body) {
//       document.body.appendChild(btn);
//       console.log("Bookmark button added to body");
//       return;
//     }
    
//     // Fallback: append to documentElement
//     if (document.documentElement) {
//       document.documentElement.appendChild(btn);
//       console.log("Bookmark button added to documentElement");
//       return;
//     }
//   } catch (error) {
//     console.error("Error creating bookmark button:", error);
//   }
// }

// // Add button when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", createBookmarkButton);
// } else {
//   // DOM already loaded
//   createBookmarkButton();
// }

// // Also try to add button after a short delay as fallback
// setTimeout(createBookmarkButton, 1000);

// // 🔥 FIXED SCROLL LISTENER
// chrome.runtime.onMessage.addListener((message) => {
//   console.log("Content script received message:", message);

//   if (message.action === "scrollTo") {
//     const container = getScrollContainer();

//     if (!container) {
//       console.log("Scroll container not found");
//       return;
//     }

//     console.log("Scrolling to:", message.scrollY);

//     const isPageRoot = container === document.scrollingElement || container === document.documentElement || container === document.body || container.nodeName === 'HTML' || container.nodeName === 'BODY';

//     if (isPageRoot) {
//       window.scrollTo({
//         top: message.scrollY,
//         behavior: "smooth"
//       });
//     } else {
//       container.scrollTo({
//         top: message.scrollY,
//         behavior: "smooth"
//       });
//     }
//   }
// });
console.log("Bookmark extension loaded on", window.location.href);

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------
function detectPlatform() {
  const h = window.location.hostname;
  if (h.includes("openai.com") || h.includes("chatgpt.com")) return "ChatGPT";
  if (h.includes("claude.ai"))           return "Claude";
  if (h.includes("gemini.google.com"))   return "Gemini";
  if (h.includes("copilot.microsoft.com")) return "Copilot";
  if (h.includes("perplexity.ai"))       return "Perplexity";
  if (h.includes("youtube.com"))         return "YouTube";
  if (h.includes("huggingface.co"))      return "HuggingFace";
  if (h.includes("deepseek.com"))        return "DeepSeek";
  if (h.includes("groq.com"))            return "Groq";
  return h.split(".").slice(-2, -1)[0]?.toUpperCase() || "WEB";
}

function getChatId() {
  return window.location.pathname + window.location.search;
}

// ---------------------------------------------------------------------------
// isScrollable — true if an element can actually scroll vertically
// ---------------------------------------------------------------------------
function isScrollable(el) {
  if (!el || el === document.documentElement || el === document.body) return false;
  const style = window.getComputedStyle(el);
  const overflow = style.overflowY;
  const canScroll = overflow === "scroll" || overflow === "auto" || overflow === "overlay";
  // Must have real overflow content, not just a tiny rounding difference
  return canScroll && el.scrollHeight > el.clientHeight + 2;
}

// ---------------------------------------------------------------------------
// PHASE 1 – well-known selectors for specific platforms / popular layouts
// Ordered from most-specific to most-generic.
// ---------------------------------------------------------------------------
const KNOWN_SELECTORS = [
  // ChatGPT
  "[data-testid='conversation-container']",
  // Perplexity
  ".overflow-y-auto",
  // Generic SPA patterns
  "[data-scroll-root]",
  "[data-testid='conversation-view']",
  "[data-testid='virtual-scroller']",
  // YouTube (comments, watch page sidebar)
  "#page-manager",
  "#contents.ytd-section-list-renderer",
  // Generic
  "[role='feed']",
  "main",
  "#main",
  ".chat-container",
  ".messages-container",
  ".conversation",
];

function findBySelectors() {
  for (const sel of KNOWN_SELECTORS) {
    try {
      const el = document.querySelector(sel);
      if (el && isScrollable(el)) return el;
    } catch (_) { /* bad selector, skip */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
// PHASE 2 – walk up from the currently focused / active element.
// This catches deeply nested custom scroll containers that no static selector
// list would ever enumerate.  We also try from document.activeElement and
// from the element under the centre of the viewport.
// ---------------------------------------------------------------------------
function findByAncestorWalk() {
  const candidates = new Set();

  // Start from active element (user just typed / clicked something)
  if (document.activeElement && document.activeElement !== document.body) {
    candidates.add(document.activeElement);
  }

  // Start from whatever is at the centre of the visible viewport
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const midEl = document.elementFromPoint(cx, cy);
  if (midEl) candidates.add(midEl);

  // Also check the bottom-centre – where chat messages end
  const bottomEl = document.elementFromPoint(cx, window.innerHeight - 40);
  if (bottomEl) candidates.add(bottomEl);

  for (const start of candidates) {
    let el = start;
    while (el && el !== document.documentElement) {
      if (isScrollable(el)) return el;
      el = el.parentElement;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// PHASE 3 – scan every scrollable element on the page and pick the one that
// covers the largest area. This is a fallback for layouts we've never seen.
// ---------------------------------------------------------------------------
function findLargestScrollable() {
  let best = null;
  let bestArea = 0;

  // Limit to a reasonable DOM walk for performance
  const all = document.querySelectorAll("div, section, article, aside, nav, ul, ol");
  for (const el of all) {
    if (!isScrollable(el)) continue;
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area > bestArea) {
      bestArea = area;
      best = el;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Master resolver – tries all three phases, caches result per call.
// Call this every time you need the container rather than storing it once at
// load time; SPAs swap their DOM after navigation.
// ---------------------------------------------------------------------------
function getScrollContainer() {
  return (
    findBySelectors()     ||  // Phase 1: O(1) fast path
    findByAncestorWalk()  ||  // Phase 2: context-aware walk
    findLargestScrollable()   // Phase 3: brute-force scan
    // Implicit fallback: caller must handle null → use window
  );
}

// ---------------------------------------------------------------------------
// Read the current scroll position for any container type
// ---------------------------------------------------------------------------
function getScrollY(container) {
  if (!container) return window.scrollY || 0;
  const isRoot =
    container === document.scrollingElement ||
    container === document.documentElement  ||
    container === document.body;
  return isRoot ? (window.scrollY || 0) : (container.scrollTop || 0);
}

// ---------------------------------------------------------------------------
// Scroll to a saved position
// ---------------------------------------------------------------------------
function scrollToY(container, y) {
  if (!container) {
    window.scrollTo({ top: y, behavior: "smooth" });
    return;
  }
  const isRoot =
    container === document.scrollingElement ||
    container === document.documentElement  ||
    container === document.body;
  if (isRoot) {
    window.scrollTo({ top: y, behavior: "smooth" });
  } else {
    container.scrollTo({ top: y, behavior: "smooth" });
  }
}

// ---------------------------------------------------------------------------
// Save bookmark
// ---------------------------------------------------------------------------
function saveBookmark() {
  const container = getScrollContainer();
  const scrollY = getScrollY(container);

  // Debug info so you can inspect what was detected
  console.log(
    "[Bookmark] Container:", container,
    "| scrollY:", scrollY,
    "| platform:", detectPlatform()
  );

  const name = prompt("Enter bookmark name:");
  if (!name || !name.trim()) return;

  const bookmark = {
    id: Date.now(),
    name: name.trim(),
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
      console.log("[Bookmark] Saved:", bookmark);
      alert(`Bookmark "${bookmark.name}" saved at scroll position ${scrollY}px`);
    });
  });
}

// ---------------------------------------------------------------------------
// Floating pin button
// ---------------------------------------------------------------------------
function createBookmarkButton() {
  if (document.getElementById("__bm-btn__")) return; // already added

  const btn = document.createElement("button");
  btn.id = "__bm-btn__";
  btn.innerText = "📌";
  btn.title = "Save bookmark at current scroll position";
  btn.className = "bookmark-btn";
  btn.addEventListener("click", saveBookmark);

  const target = document.body || document.documentElement;
  if (target) {
    target.appendChild(btn);
    console.log("[Bookmark] Button injected");
  }
}

// Inject as soon as possible; retry once for slow-loading SPAs
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createBookmarkButton);
} else {
  createBookmarkButton();
}
setTimeout(createBookmarkButton, 1500);

// Re-inject after SPA navigations (pushState / replaceState / popstate)
const _push = history.pushState.bind(history);
const _replace = history.replaceState.bind(history);
history.pushState = (...args) => { _push(...args); setTimeout(createBookmarkButton, 800); };
history.replaceState = (...args) => { _replace(...args); setTimeout(createBookmarkButton, 800); };
window.addEventListener("popstate", () => setTimeout(createBookmarkButton, 800));

// ---------------------------------------------------------------------------
// Message listener (called from popup to jump to a saved bookmark)
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== "scrollTo") return;

  const container = getScrollContainer();
  console.log(
    "[Bookmark] Jump to y:", message.scrollY,
    "| container:", container
  );

  scrollToY(container, message.scrollY);
  sendResponse({ ok: true });
});