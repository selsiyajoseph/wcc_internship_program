let mediaRecorder = null;
let recordedChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");
const autoStartEl = document.getElementById("autoStart");
const radios = document.querySelectorAll('input[name="mode"]');

function setStatus(msg) { statusEl.textContent = msg; }

// Load prefs
chrome.storage.local.get({ mode: "both", autoStart: false }, ({ mode, autoStart }) => {
  [...radios].forEach(r => r.checked = (r.value === mode));
  autoStartEl.checked = !!autoStart;
});

// Save prefs
radios.forEach(r => r.addEventListener("change", () => {
  chrome.storage.local.set({ mode: r.value });
  setStatus("Mode set: " + r.value);
}));

autoStartEl.addEventListener("change", () => {
  chrome.storage.local.set({ autoStart: autoStartEl.checked });
  setStatus("Auto-start: " + (autoStartEl.checked ? "ON" : "OFF"));
});

// Listen for meeting flag updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.meetingActive) {
    const meetingActive = changes.meetingActive.newValue;
    if (autoStartEl.checked) {
      if (meetingActive) startRecording();
      else stopRecording();
    }
  }
});

// Manual start/stop
startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);

// ----- Recording logic -----
function startRecording() {
  if (mediaRecorder) {
    setStatus("Already recording...");
    return;
  }
  chrome.storage.local.get({ mode: "both" }, ({ mode }) => {
    const wantsAudio = mode !== "video";
    const wantsVideo = mode !== "audio";

    chrome.tabCapture.capture({ audio: wantsAudio, video: wantsVideo }, (stream) => {
      if (!stream) {
        setStatus("Failed: " + chrome.runtime.lastError?.message);
        return;
      }

      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url, filename: `teams-${mode}-${Date.now()}.webm` });
        setStatus("Recording saved.");
        mediaRecorder = null;
      };

      mediaRecorder.start();
      setStatus("Recording started (" + mode + ")");
    });
  });
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    setStatus("Stopping...");
  } else {
    setStatus("Not recording.");
  }
}
