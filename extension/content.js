// Sidekick Content Script - Context Extraction with Gmail Support

function extractPageContext() {
  const isGmail = window.location.hostname.includes("mail.google.com");

  if (isGmail) {
    console.log("⚡ Sidekick: Gmail page detected. Extracting email thread context...");
    
    // Extract Gmail email subject
    const subjectEl = document.querySelector("h2.hP") || document.querySelector(".hP");
    const subject = subjectEl ? subjectEl.innerText.trim() : "";

    // Extract active email body containers (Gmail's main message body selectors)
    const emailBodyEls = document.querySelectorAll(".a3s.aiL, div[role='main'] .ii.gt, .h7");
    let emailTexts = [];

    emailBodyEls.forEach((el) => {
      const text = el.innerText.trim();
      if (text && !emailTexts.includes(text)) {
        emailTexts.push(text);
      }
    });

    if (emailTexts.length > 0) {
      const combinedEmail = `Subject: ${subject}\n\nEmail Content:\n${emailTexts.join("\n\n---\n\n")}`;
      return combinedEmail;
    }
  }

  // Fallback for general webpages
  return document.body ? document.body.innerText.trim() : "";
}

// Listen for requests from side panel to extract page content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PAGE_CONTEXT") {
    const pageText = extractPageContext();
    sendResponse({
      success: true,
      title: document.title,
      url: window.location.href,
      pageContext: pageText
    });
  }
  return true; // Keeps the message channel open for async response
});

console.log("Sidekick content script loaded (Gmail enhanced).");
