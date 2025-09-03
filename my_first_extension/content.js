console.log("✅ Teams Monitor content.js loaded!");

(function () {
  let meetingStarted = false;
  let startTime = null;
  let justEnded = false;

  function logMeetingStart() {
    if (meetingStarted || justEnded) return;
    startTime = new Date();
    meetingStarted = true;
    console.log(`[Teams Monitor] ✅ Meeting started at: ${startTime.toLocaleString()}`);

    chrome.runtime.sendMessage({
      type: "meeting-start",
      time: startTime.toLocaleTimeString()
    });

    // also set storage flag
    chrome.storage.local.set({ meetingActive: true });
  }

  function logMeetingEnd() {
    if (!meetingStarted) return;
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationSeconds = Math.floor(durationMs / 1000);
    const durationMinutes = Math.floor(durationSeconds / 60);
    const remainingSeconds = durationSeconds % 60;

    console.log(`[Teams Monitor] 🛑 Meeting ended at: ${endTime.toLocaleString()}`);
    meetingStarted = false;
    justEnded = true;

    chrome.runtime.sendMessage({
      type: "meeting-end",
      time: endTime.toLocaleTimeString(),
      duration: `${durationMinutes} min ${remainingSeconds} sec`
    });

    // also reset flag
    chrome.storage.local.set({ meetingActive: false });

    setTimeout(() => { justEnded = false; }, 5000);
  }

  // Observe DOM
  const observer = new MutationObserver(() => {
    const leaveButton = document.querySelector('button[aria-label="Leave"]');
    if (leaveButton && !leaveButton.dataset.listenerAdded) {
      leaveButton.addEventListener("click", () => logMeetingEnd());
      leaveButton.dataset.listenerAdded = true;
    }

    const toolbar = document.querySelector('div[role="toolbar"][aria-label="Meeting controls"]');
    if (toolbar) {
      logMeetingStart();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  console.log("✅ Teams Meeting Monitor is running...");
})();
