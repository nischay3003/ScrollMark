const list = document.getElementById("list");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  const currentUrl = new URL(currentTab.url);
  const currentChatId = currentUrl.pathname;

  chrome.storage.local.get(["bookmarks"], (data) => {
    const allBookmarks = data.bookmarks || [];
    const bookmarks = allBookmarks.filter(bm => bm.chatId === currentChatId);
    console.log("Filtered bookmarks for current chat:", bookmarks);

    bookmarks.forEach((bm) => {
      const li = document.createElement("li");
      li.className = "bookmark-item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "bookmark-name";
      nameSpan.innerText = `${bm.name} (${bm.createdAt})`;
      nameSpan.title = bm.name;

      nameSpan.onclick = () => {
          console.log("Bookmark clicked:", bm);
        chrome.tabs.sendMessage(currentTab.id, {
            action: "scrollTo",
            scrollY: bm.scrollY
        });
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
          li.remove();
        });
      };

      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  });
});