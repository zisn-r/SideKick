// Sidekick Content Script

// Listen for requests from side panel to extract page content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PAGE_CONTEXT") {
    const pageText = document.body ? document.body.innerText : "";
    sendResponse({
      success: true,
      title: document.title,
      url: window.location.href,
      pageContext: pageText.trim()
    });
  }
  return true; // Keeps the message channel open for async response
});

console.log("Sidekick content script loaded.");
