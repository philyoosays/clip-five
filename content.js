// content.js

document.addEventListener('copy', (event) => {
  // Use a timeout to ensure the clipboard has been updated
  setTimeout(() => {
    // Attempt to read the clipboard data
    navigator.clipboard.readText()
      .then(copiedText => {
        if (copiedText) {
          // Send the copied text to the background service worker
          chrome.runtime.sendMessage({ action: "copyDetected", text: copiedText });
        }
      })
      .catch(err => {
        console.error('Failed to read clipboard: ', err);
      });
  }, 100); // Small delay to let the OS/browser update the clipboard
}, true); // Use 'true' for capture phase to ensure it runs before page scripts