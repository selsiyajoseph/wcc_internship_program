console.log("🚀 Background service worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  chrome.notifications.create("installed-" + Date.now(), {
    type: "basic",
    iconUrl: "icon.png",
    title: "Teams Recorder",
    message: "Extension installed & ready!"
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "meeting-start") {
    chrome.notifications.create("meeting-start-" + Date.now(), {
      type: "basic",
      iconUrl: "icon.png",
      title: "Meeting Started",
      message: `Started at ${msg.time}`
    });
    // Save flag so popup.js can auto-start
    chrome.storage.local.set({ meetingActive: true });
  }

  if (msg.type === "meeting-end") {
    chrome.notifications.create("meeting-end-" + Date.now(), {
      type: "basic",
      iconUrl: "icon.png",
      title: "Meeting Ended",
      message: `Ended at ${msg.time}\nDuration: ${msg.duration}`
    });
    // Clear flag so popup.js can auto-stop
    chrome.storage.local.set({ meetingActive: false });
  }

  sendResponse({ status: "ok" });
  return true;
});
