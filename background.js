// background.js
const MAX_ENTRIES = 5;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyDetected" && request.text) {
    updateClipboardHistory(request.text);
  }
});

// Function to manage the list of copied items
function updateClipboardHistory(newEntry) {
  // Use local storage to save the history
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    let history = result.clipboardHistory || [];

    // 1. Remove duplicates (if the user copies the same thing twice)
    history = history.filter(item => item !== newEntry);

    // 2. Add the new entry to the start of the array
    history.unshift(newEntry);

    // 3. Limit the list to 5 entries
    if (history.length > MAX_ENTRIES) {
      history = history.slice(0, MAX_ENTRIES);
    }

    // 4. Save the updated list
    chrome.storage.local.set({ clipboardHistory: history });
  });
}