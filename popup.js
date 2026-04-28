const list = document.getElementById("list");
const filterAllBtn = document.getElementById("filter-all");
const filterCurrentBtn = document.getElementById("filter-current");
let filterMode = "current"; // "current" or "all"

// Detect current platform
function detectCurrentPlatform() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) return 'ChatGPT';
  if (hostname.includes('claude.ai')) return 'Claude';
  if (hostname.includes('gemini.google.com')) return 'Gemini';
  if (hostname.includes('copilot.microsoft.com')) return 'Copilot';
  if (hostname.includes('perplexity.ai')) return 'Perplexity';
  if (hostname.includes('huggingface.co')) return 'HuggingFace';
  if (hostname.includes('deepseek.com')) return 'DeepSeek';
  if (hostname.includes('groq.com')) return 'Groq';
  
  return hostname.split('.')[0].toUpperCase();
}

function renderBookmarks() {
  list.innerHTML = ""; // Clear list
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const currentUrl = new URL(currentTab.url);
    const currentChatId = currentUrl.pathname + currentUrl.search;
    const currentPlatform = detectCurrentPlatform();

    chrome.storage.local.get(["bookmarks"], (data) => {
      const allBookmarks = data.bookmarks || [];
      
      let bookmarks;
      if (filterMode === "current") {
        // Show bookmarks from current chat on current platform
        bookmarks = allBookmarks.filter(bm => bm.chatId === currentChatId);
      } else {
        // Show all bookmarks across all platforms
        bookmarks = allBookmarks;
      }
      
      console.log("Filtered bookmarks:", bookmarks);

      if (bookmarks.length === 0) {
        const emptyMsg = document.createElement("li");
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "#999";
        emptyMsg.innerText = filterMode === "current" ? "No bookmarks in this chat" : "No bookmarks saved";
        list.appendChild(emptyMsg);
        return;
      }

      bookmarks.forEach((bm) => {
        const li = document.createElement("li");
        li.className = "bookmark-item";

        // Container for text content
        const textContainer = document.createElement("div");
        textContainer.className = "bookmark-text-container";

        // Platform badge
        const platformBadge = document.createElement("span");
        platformBadge.className = "platform-badge";
        platformBadge.innerText = bm.platform || 'Web';
        platformBadge.title = bm.platform || 'General Website';

        // Bookmark name
        const nameSpan = document.createElement("span");
        nameSpan.className = "bookmark-name";
        nameSpan.innerText = `${bm.name} (${bm.createdAt})`;
        nameSpan.title = bm.name;

        nameSpan.onclick = () => {
          console.log("Bookmark clicked:", bm);
          if (filterMode === "current") {
            chrome.tabs.sendMessage(currentTab.id, {
              action: "scrollTo",
              scrollY: bm.scrollY
            });
          } else {
            // For "all" mode: check if user is on same page
            const bookmarkURL = new URL(bm.url);
            const currentTabURL = new URL(currentTab.url);
            
            // Compare: protocol + hostname + pathname (ignoring query params and hash)
            const isSamePage = 
              bookmarkURL.protocol === currentTabURL.protocol &&
              bookmarkURL.hostname === currentTabURL.hostname &&
              bookmarkURL.pathname === currentTabURL.pathname;
            
            if (isSamePage) {
              // Same page: scroll on current tab
              console.log("Same page detected, scrolling on current tab");
              chrome.tabs.sendMessage(currentTab.id, {
                action: "scrollTo",
                scrollY: bm.scrollY
              });
            } else {
              // Different page: create new tab and scroll
              console.log("Different page, opening new tab");
              chrome.tabs.create({ url: bm.url }, (newTab) => {
                // Wait for page to load before scrolling
                setTimeout(() => {
                  chrome.tabs.sendMessage(newTab.id, {
                    action: "scrollTo",
                    scrollY: bm.scrollY
                  });
                }, 1500);
              });
            }
          }
        };

        const deleteBtn = document.createElement("i");
        deleteBtn.className = "material-icons";
        deleteBtn.id = "delete-btn";
        deleteBtn.innerHTML = "delete";
        deleteBtn.title = "Delete bookmark";
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          const updatedBookmarks = allBookmarks.filter(bookmark => bookmark.id !== bm.id);
          chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
            renderBookmarks(); // Re-render after deletion
          });
        };

        textContainer.appendChild(platformBadge);
        textContainer.appendChild(nameSpan);
        li.appendChild(textContainer);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    });
  });
}

// Filter mode buttons
if (filterAllBtn) {
  filterAllBtn.onclick = () => {
    filterMode = "all";
    filterAllBtn.classList.add("active");
    filterCurrentBtn.classList.remove("active");
    renderBookmarks();
  };
}

if (filterCurrentBtn) {
  filterCurrentBtn.onclick = () => {
    filterMode = "current";
    filterCurrentBtn.classList.add("active");
    filterAllBtn.classList.remove("active");
    renderBookmarks();
  };
}

// Initial render
renderBookmarks();