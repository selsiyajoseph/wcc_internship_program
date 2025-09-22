// Fires whenever a tab changes URL or finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    /https:\/\/.*teams.*\.com/.test(tab.url)
  ) {
    // Notify any open popup
    chrome.runtime.sendMessage({ action: "teamsTabDetected", tabId });

    // Optional desktop notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Teams Recorder",
      message: "Teams tab detected! Open the extension to start recording."
    });
  }
});
