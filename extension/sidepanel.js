// Sidekick Side Panel Logic

console.log("Sidekick ready");

const BACKEND_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chatContainer");
  const loadingIndicator = document.getElementById("loadingIndicator");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const requestText = userInput.value.trim();
    if (!requestText) return;

    // Render user message
    appendMessage(requestText, "user");
    userInput.value = "";

    // Show "Thinking..." loading indicator
    setLoading(true);

    try {
      // Get active tab and request page context from content script
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) {
        appendMessage("⚠️ Unable to access the active browser tab.", "assistant");
        setLoading(false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: "GET_PAGE_CONTEXT" }, async (pageData) => {
        const pageContext = (pageData && pageData.pageContext) ? pageData.pageContext : "";

        console.log("Sending context + request to Sidekick Backend:", { userRequest: requestText, pageContextLength: pageContext.length });

        try {
          // Call backend agent endpoint
          const res = await fetch(`${BACKEND_URL}/agent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userRequest: requestText, pageContext })
          });

          let data;
          try {
            data = await res.json();
          } catch (jsonErr) {
            data = { error: "Invalid JSON response from server." };
          }

          setLoading(false);
          console.log("Agent response received:", data);

          if (!res.ok || data.error) {
            appendMessage(`⚠️ ${data.error || "Something went wrong. Please try again."}`, "assistant");
            return;
          }

          // Handle tool call or textual answer
          if (data.hasToolCall && data.eventDetails) {
            renderEventConfirmationCard(data.eventDetails);
          } else {
            appendMessage(data.message || "I couldn't find any event information on this page.", "assistant");
          }

        } catch (backendErr) {
          console.error("Backend connection error:", backendErr);
          setLoading(false);
          appendMessage("⚠️ Cannot connect to Sidekick Backend server. Please ensure the backend is running at http://localhost:3000.", "assistant");
        }
      });
    } catch (err) {
      console.error("Error accessing active tab:", err);
      setLoading(false);
      appendMessage("⚠️ Something went wrong while inspecting the current page. Please try again.", "assistant");
    }
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.innerHTML = text;

    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv;
  }

  function renderEventConfirmationCard(eventDetails) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message assistant-message";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const cardContainer = document.createElement("div");
    cardContainer.className = "event-card";

    const header = document.createElement("div");
    header.className = "event-card-header";
    header.textContent = "📅 Create Calendar Event?";

    const title = document.createElement("div");
    title.className = "event-card-title";
    title.textContent = eventDetails.title || "Meeting";

    const date = document.createElement("div");
    date.className = "event-card-detail";
    date.textContent = `📆 ${eventDetails.date || "TBD"} at ${eventDetails.time || "TBD"}`;

    cardContainer.appendChild(header);
    cardContainer.appendChild(title);
    cardContainer.appendChild(date);

    if (eventDetails.location) {
      const location = document.createElement("div");
      location.className = "event-card-detail";
      location.textContent = `📍 ${eventDetails.location}`;
      cardContainer.appendChild(location);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "card-actions";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn-card btn-confirm";
    confirmBtn.textContent = "Confirm";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-card btn-cancel";
    cancelBtn.textContent = "Cancel";

    actionsDiv.appendChild(confirmBtn);
    actionsDiv.appendChild(cancelBtn);
    cardContainer.appendChild(actionsDiv);

    contentDiv.appendChild(cardContainer);
    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Confirm Action
    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      confirmBtn.textContent = "Creating...";

      try {
        const response = await fetch(`${BACKEND_URL}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventDetails)
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          actionsDiv.remove();
          const statusNotice = document.createElement("div");
          statusNotice.style.color = "#10b981";
          statusNotice.style.fontWeight = "600";
          statusNotice.style.marginTop = "8px";
          statusNotice.textContent = `✅ Added "${eventDetails.title || 'Meeting'}" to your calendar.`;
          cardContainer.appendChild(statusNotice);
        } else {
          confirmBtn.disabled = false;
          cancelBtn.disabled = false;
          confirmBtn.textContent = "Confirm";
          appendMessage(`⚠️ ${result.error || "Failed to create calendar event. Please try again."}`, "assistant");
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        confirmBtn.textContent = "Confirm";
        appendMessage("⚠️ Network error during event creation. Please check backend connection.", "assistant");
      }
    });

    // Cancel Action
    cancelBtn.addEventListener("click", () => {
      actionsDiv.remove();
      const cancelNotice = document.createElement("div");
      cancelNotice.style.color = "#94a3b8";
      cancelNotice.style.marginTop = "8px";
      cancelNotice.style.fontStyle = "italic";
      cancelNotice.textContent = "Action cancelled.";
      cardContainer.appendChild(cancelNotice);
    });
  }

  function setLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove("hidden");
    } else {
      loadingIndicator.classList.add("hidden");
    }
  }
});
