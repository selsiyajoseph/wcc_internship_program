let mediaRecorder;
let recordedChunks = [];
let activeTabId;

// 1. Enable button if background tells us a Teams tab is ready
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "teamsTabDetected") {
    activeTabId = msg.tabId;
    document.getElementById("startBtn").disabled = false;
  }
});

// 2. Also check the current tab when the popup opens
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (/https:\/\/.*teams.*\.com/.test(tab.url)) {
    activeTabId = tab.id;
    document.getElementById("startBtn").disabled = false;
  }
});

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");

startBtn.addEventListener("click", () => {
  chrome.tabCapture.capture({ audio: true, video: true }, (stream) => {
    if (!stream) {
      alert("Failed to start recording. Make sure you're on a Teams tab.");
      return;
    }

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url  = URL.createObjectURL(blob);
      chrome.downloads.download({
        url,
        filename: "teams_recording.webm"
      });
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled  = false;
  });
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled  = true;
  }
});
