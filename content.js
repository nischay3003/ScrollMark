console.log("Content script loaded on", window.location.href);

function getChatId() {
  return window.location.pathname;
}

// 🔥 NEW: get correct scroll container
function getScrollContainer() {
  return document.querySelector('[data-scroll-root]');
}

function saveBookmark() {
  const container = getScrollContainer();

  if (!container) {
    console.log("Scroll container not found");
    return;
  }

  const scrollY = container.scrollTop; // ✅ FIXED
  const name = prompt("Enter bookmark name:");

  if (!name || name.trim() === "") {
    console.log("Bookmark name not provided");
    return;
  }

  console.log("Saving scroll:", scrollY);

  const bookmark = {
    id: Date.now(),
    name: name.trim(),
    scrollY: scrollY,
    chatId: getChatId(),
    createdAt: new Date().toLocaleString()
  };

  chrome.storage.local.get(["bookmarks"], (data) => {
    const bookmarks = data.bookmarks || [];
    bookmarks.push(bookmark);

    chrome.storage.local.set({ bookmarks }, () => {
      alert("Bookmark saved!");
    });
  });
}

// 🔘 Floating button
const btn = document.createElement("button");
btn.innerText = "📌";
btn.className = "bookmark-btn";
btn.onclick = saveBookmark;
document.body.appendChild(btn);

// 🔥 FIXED SCROLL LISTENER
chrome.runtime.onMessage.addListener((message) => {
  console.log("Content script received message:", message);

  if (message.action === "scrollTo") {
    const container = getScrollContainer();

    if (!container) {
      console.log("Scroll container not found");
      return;
    }

    console.log("Scrolling to:", message.scrollY);

    container.scrollTo({
      top: message.scrollY,
      behavior: "smooth"
    });
  }
});