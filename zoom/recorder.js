// This runs in a separate tab that stays open for recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let timerInterval;
let recordingStartTime;
let isAutoRecord = false;
let downloadCompleted = false;

console.log("🎬 Recorder tab loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨📨📨 RECORDER TAB MESSAGE RECEIVED 📨📨📨");
  console.log("Message:", message);
  console.log("Sender:", sender);
  
  if (message.action === "startRecording") {
    console.log("🎬 START RECORDING message received");
    isAutoRecord = message.autoRecord || false;
    startRecording(message.tabId);
    sendResponse({ success: true });
  }
  
  if (message.action === "stopRecording") {
    console.log("🛑🛑🛑 STOP RECORDING MESSAGE RECEIVED - EXECUTING NOW!!! 🛑🛑🛑");
    stopRecording();
    sendResponse({ success: true });
  }
  
  return true;
});

async function startRecording(tabId) {
  console.log("🎬 Starting recording for tab:", tabId);
  
  if (isRecording) {
    console.log("⚠️ Already recording, ignoring start request");
    return;
  }

  try {
    document.getElementById("status").textContent = "🟡 Starting recording...";
    console.log("📋 Getting tab capture permission for tab:", tabId);

    // Show recording popup immediately
    chrome.runtime.sendMessage({ action: "showRecordingPopup" });

    // Get tab stream using the provided tabId
    const tabStream = await new Promise((resolve, reject) => {
  console.log("🎬 Capturing tab using SIMPLE method");

  chrome.tabCapture.capture({
    audio: true,
    video: true
  }, (stream) => {

    console.log("📌 Tab capture callback fired");

    if (chrome.runtime.lastError) {
      console.error("❌ Tab capture error:", chrome.runtime.lastError);
      reject(new Error(chrome.runtime.lastError.message));
      return;
    }

    if (!stream) {
      console.error("❌ No stream returned");
      reject(new Error("No stream"));
      return;
    }

    console.log("✅ Tab stream captured successfully");
    resolve(stream);
  });
});

    console.log("✅ Tab stream captured, tracks:", tabStream.getTracks().length);

    let finalStream = tabStream;

    // Try to add microphone audio
    try {
      console.log("🎤 Attempting to capture microphone...");
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2
        },
        video: false
      });

      console.log("✅ Microphone captured");

      // Mix audio using AudioContext
      const audioContext = new AudioContext({ sampleRate: 44100 });
      const destination = audioContext.createMediaStreamDestination();

      const tabAudioSource = audioContext.createMediaStreamSource(
        new MediaStream(tabStream.getAudioTracks())
      );
      const micAudioSource = audioContext.createMediaStreamSource(micStream);

      tabAudioSource.connect(destination);
      micAudioSource.connect(destination);

      // Create final stream with mixed audio
      finalStream = new MediaStream([
        ...tabStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      console.log("✅ Audio mixed successfully");

    } catch (micError) {
      console.warn("⚠️ Microphone not available, using tab audio only:", micError);
      // Continue with tab audio only
      finalStream = tabStream;
    }

    // Setup MediaRecorder
    console.log("📹 Setting up MediaRecorder");
    console.log("📊 Final stream tracks - Video:", finalStream.getVideoTracks().length, "Audio:", finalStream.getAudioTracks().length);
    
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];

    let supportedType = 'video/webm';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedType = type;
        console.log("✅ Supported MIME type found:", supportedType);
        break;
      }
    }
    
    console.log("🎥 Using MIME type:", supportedType);

    try {
      mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: supportedType,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      });
      console.log("✅ MediaRecorder created successfully");
    } catch (recordError) {
      console.error("❌ Failed to create MediaRecorder:", recordError);
      // Fallback: try without MIME type
      console.warn("⚠️ Trying MediaRecorder without MIME type...");
      try {
        mediaRecorder = new MediaRecorder(finalStream);
        console.log("✅ MediaRecorder created (no MIME type)");
      } catch (fallbackError) {
        console.error("❌ Failed to create MediaRecorder even without MIME type:", fallbackError);
        throw new Error("Cannot create MediaRecorder: " + fallbackError.message);
      }
    }

    recordedChunks = [];
    isRecording = true;
    recordingStartTime = Date.now();
    downloadCompleted = false;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log("📦 Data chunk:", event.data.size, "bytes, total chunks:", recordedChunks.length);
      }
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped, total chunks:", recordedChunks.length);
      stopTimer();
      downloadRecording();
    };

    mediaRecorder.onerror = (event) => {
      console.error("❌ MediaRecorder error:", event);
      document.getElementById("status").textContent = "❌ Recording error";
      cleanup();
    };

    // Start recording with 1-second chunks
    mediaRecorder.start(1000);
    console.log("✅ Recording started in background tab!");

    // Update UI
    document.getElementById("status").textContent = isAutoRecord 
      ? "🟢 Auto Recording in background..." 
      : "🟢 Recording in background...";
    startTimer();

    // Save recording state to storage
    await chrome.storage.local.set({ 
      isRecording: true,
      recordingStartTime: recordingStartTime
    });

    // Notify background
    chrome.runtime.sendMessage({ action: "recordingStarted" });

  } catch (error) {
    console.error("❌ Recording start FAILED with error:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    
    document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
    
    // Hide recording popup on error
    chrome.runtime.sendMessage({ action: "hideRecordingPopup" });
    
    // Show retry button for auto recordings
    if (isAutoRecord) {
      const retryButton = document.createElement('button');
      retryButton.textContent = 'Retry Recording';
      retryButton.style.cssText = `
        padding: 10px 20px;
        margin: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      `;
      retryButton.onclick = () => startRecording(tabId);
      document.body.appendChild(retryButton);
    }
  }
}

function stopRecording() {
  console.log("🛑 STOP RECORDING called");
  
  if (!mediaRecorder) return;
  
  if (mediaRecorder.state === 'recording') {
    isRecording = false;
    mediaRecorder.stop();
  }
  
  chrome.runtime.sendMessage({ action: "hideRecordingPopup" });
}

function startTimer() {
  let seconds = 0;
  const timerEl = document.getElementById("timer");
  
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    const timeString = `${minutes}:${secs}`;
    
    timerEl.textContent = timeString;
    
    // Save time to storage
    chrome.storage.local.set({ recordingTime: timeString });
    
    // Send timer update to background and content script
    chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
    
    // Send timer update to content script for the popup
    chrome.runtime.sendMessage({ 
      action: "updateRecordingTimer", 
      time: timeString 
    });
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function downloadRecording() {
  console.log("💾💾💾 DOWNLOAD RECORDING CALLED 💾💾💾");
  console.log("📊 Chunks available:", recordedChunks.length);
  
  if (recordedChunks.length === 0) {
    console.warn("⚠️ No recorded data - cannot download");
    document.getElementById("status").textContent = "❌ No recording data to save";
    cleanup();
    return;
  }

  try {
    console.log("💾 Creating Blob from", recordedChunks.length, "chunks");
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    console.log("✅ Blob created, size:", blob.size, "bytes");
    
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('Z')[0];
    const filename = `zoom-recording-${timestamp}.webm`;

    console.log("💾 DOWNLOADING NOW:", filename);
    console.log("📊 File size:", blob.size, "bytes");

    // Download automatically without "Save As" popup
    chrome.downloads.download({
      url: url,
      filename: filename
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("❌ DOWNLOAD ERROR:", chrome.runtime.lastError);
        document.getElementById("status").textContent = "❌ Download error: " + chrome.runtime.lastError.message;
        fallbackDownload(blob, filename);
      } else {
        console.log("✅✅✅ DOWNLOAD STARTED WITH ID:", downloadId, "✅✅✅");
        document.getElementById("status").textContent = "✅ Recording saved to Downloads!";
        downloadCompleted = true;
        
        // Mark chunks as downloaded to prevent redownload
        recordedChunks = [];
        
        // Cleanup after successful download
        setTimeout(() => {
          console.log("🧹 Cleaning up after download");
          cleanup();
        }, 2000);
      }
    });

  } catch (error) {
    console.error("Download failed:", error);
    cleanup();
  }
}

function cleanup() {
  console.log("Cleanup");
  isRecording = false;
  recordedChunks = [];
  
  if (timerInterval) clearInterval(timerInterval);
  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  }
  
  chrome.storage.local.remove(['isRecording', 'recordingTime']);
  chrome.runtime.sendMessage({ action: "recordingStopped" });
}
