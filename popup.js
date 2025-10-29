// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const listElement = document.getElementById('history-list');

    // 1. Load history from storage
    chrome.storage.local.get(['clipboardHistory'], (result) => {
        const history = result.clipboardHistory || [];
        listElement.innerHTML = ''; // Clear the "Loading..." message

        if (history.length === 0) {
            listElement.innerHTML = '<div id="message">No copied items yet.</div>';
            return;
        }

        // 2. Create a list item for each entry
        history.forEach((text, index) => {
            const item = document.createElement('div');
            item.className = 'clip-item';
            // Display a truncated version of the text
            item.textContent = `${index + 1}. ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`; 
            item.title = text; // Full text on hover
            item.dataset.text = text; // Store the full text

            item.addEventListener('click', (e) => {
                const textToPaste = e.currentTarget.dataset.text;
                pasteText(textToPaste);
            });

            listElement.appendChild(item);
        });
    });
});

// Function to paste the selected text into the active tab
function pasteText(text) {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        
        const activeTabId = tabs[0].id;
        
        // Use scripting API to inject a function that inserts text directly
        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: (content) => {
                // Get the currently focused element
                const activeElement = document.activeElement;
                
                // Handle different input types
                if (activeElement && (
                    activeElement.tagName === 'INPUT' || 
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                )) {
                    if (activeElement.isContentEditable) {
                        // For contentEditable elements
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(document.createTextNode(content));
                            range.collapse(false);
                        }
                    } else {
                        // For input and textarea elements
                        const start = activeElement.selectionStart;
                        const end = activeElement.selectionEnd;
                        const currentValue = activeElement.value;
                        
                        // Insert text at cursor position
                        activeElement.value = currentValue.substring(0, start) + content + currentValue.substring(end);
                        
                        // Set cursor position after inserted text
                        activeElement.selectionStart = activeElement.selectionEnd = start + content.length;
                        
                        // Trigger input event for frameworks like React
                        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    alert("Clip-Five: Please click on a text field first.");
                }
            },
            args: [text]
        });

        // Close the popup after selection
        window.close();
    });
}