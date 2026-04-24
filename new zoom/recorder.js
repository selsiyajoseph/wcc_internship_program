// // This runs in a separate tab that stays open for recording
// let mediaRecorder;
// let recordedChunks = [];
// let micStreamGlobal = null;
// let isRecording = false;
// let timerInterval;
// let recordingStartTime;
// let isAutoRecord = false;
// let downloadCompleted = false;

// console.log("🎬 Recorder tab loaded");

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨📨📨 RECORDER TAB MESSAGE RECEIVED 📨📨📨");
//   console.log("Message:", message);
//   console.log("Sender:", sender);
  
//   if (message.action === "startRecording") {
//     console.log("🎬 START RECORDING message received");
//     isAutoRecord = message.autoRecord || false;
//     startRecording(message.tabId);
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "stopRecording") {
//     console.log("🛑🛑🛑 STOP RECORDING MESSAGE RECEIVED - EXECUTING NOW!!! 🛑🛑🛑");
//     stopRecording();
//     sendResponse({ success: true });
//   }
  
//   // ADD MUTE HANDLING HERE
//   if (message.action === "zoomMuteChanged") {
//     console.log("🎤 MUTE STATE RECEIVED:", message.muted ? "MUTED" : "UNMUTED");
    
//     if (micStreamGlobal) {
//       micStreamGlobal.getAudioTracks().forEach(track => {
//         track.enabled = !message.muted;
//         console.log(`🎤 Track ${track.id}: enabled = ${track.enabled} (Zoom muted: ${message.muted})`);
//       });
//     }
//     sendResponse({ success: true });
//   }
  
//   return true; // Keep this for async
// });

// async function startRecording(tabId) {
//   console.log("🎬 Starting recording for tab:", tabId);
  
//   if (isRecording) {
//     console.log("⚠️ Already recording, ignoring start request");
//     return;
//   }

//   try {
//     document.getElementById("status").textContent = "🟡 Starting recording...";
//     console.log("📋 Getting tab capture permission for tab:", tabId);

//     // Show recording popup immediately
//     chrome.runtime.sendMessage({ action: "showRecordingPopup" });

//     // Get tab stream using the provided tabId
//     const tabStream = await new Promise((resolve, reject) => {
//   console.log("🎬 Capturing tab using SIMPLE method");

//   chrome.tabCapture.capture({
//     audio: true,
//     video: true
//   }, (stream) => {

//     console.log("📌 Tab capture callback fired");

//     if (chrome.runtime.lastError) {
//       console.error("❌ Tab capture error:", chrome.runtime.lastError);
//       reject(new Error(chrome.runtime.lastError.message));
//       return;
//     }

//     if (!stream) {
//       console.error("❌ No stream returned");
//       reject(new Error("No stream"));
//       return;
//     }

//     console.log("✅ Tab stream captured successfully");
//     resolve(stream);
//   });
// });

//     console.log("✅ Tab stream captured, tracks:", tabStream.getTracks().length);

//     let finalStream = tabStream;

//     // Try to add microphone audio
//     // Replace the TRY-CATCH mic section with this:
// // 👇 REPLACE your entire TRY-CATCH mic section with this:
// try {
//   console.log("🎤=== MIC CAPTURE PHASE ===");
  
//   const micPerm = await navigator.permissions.query({name: 'microphone'});
//   console.log("🎤 Mic permission state:", micPerm.state);
  
//   micStreamGlobal = await navigator.mediaDevices.getUserMedia({
//     audio: { sampleRate: 48000, channelCount: 1, echoCancellation: false }
//   });
  
//   console.log("✅🎤 MIC STREAM CAPTURED:", micStreamGlobal.getAudioTracks().length);
  
//   // MIC ALWAYS ON
//   micStreamGlobal.getAudioTracks().forEach(track => {
//     track.enabled = true;
//     console.log("✅ MIC TRACK ENABLED");
//   });
  
//   // ===== CRITICAL: MIX AUDIO =====
//   const audioContext = new AudioContext({ sampleRate: 48000 });
//   const destination = audioContext.createMediaStreamDestination();
  
//   const tabAudioSource = audioContext.createMediaStreamSource(
//     new MediaStream(tabStream.getAudioTracks())
//   );
//   const micAudioSource = audioContext.createMediaStreamSource(micStreamGlobal);
  
//   tabAudioSource.connect(destination);
//   micAudioSource.connect(destination);
  
//   finalStream = new MediaStream([
//     ...tabStream.getVideoTracks(),
//     destination.stream.getAudioTracks()[0]
//   ]);
  
//   console.log("✅ FINAL MIXED STREAM:", finalStream.getVideoTracks().length, "V +", finalStream.getAudioTracks().length, "A");
  
// } catch (micError) {
//   console.error("❌ MIC FAILED:", micError);
//   finalStream = tabStream;  // Fallback
// }
// // ===== FIXED MUTE-AWARE AUDIO MIXING =====
// if (micStreamGlobal) {
//   console.log("🔀 SETTING UP MUTE-AWARE AUDIO MIXING...");
  
//   const audioContext = new AudioContext({ sampleRate: 48000 });
//   const destination = audioContext.createMediaStreamDestination();
  
//   // Always include tab audio (other participants)
//   const tabAudioSource = audioContext.createMediaStreamSource(
//     new MediaStream(tabStream.getAudioTracks())
//   );
//   tabAudioSource.connect(destination);
  
//   // Create gain node for microphone control
//   const micSource = audioContext.createMediaStreamSource(micStreamGlobal);
//   const micGain = audioContext.createGain();
  
//   // Set initial gain based on current mute state
//   const isCurrentlyMuted = micStreamGlobal.getAudioTracks().some(track => !track.enabled);
//   micGain.gain.value = isCurrentlyMuted ? 0 : 1;
//   console.log(`🎤 Initial mic state: ${isCurrentlyMuted ? 'MUTED' : 'UNMUTED'} (gain: ${micGain.gain.value})`);
  
//   micSource.connect(micGain);
//   micGain.connect(destination);
  
//   // Monitor mute state in real-time
//   const bufferSize = 256;
//   const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
  
//   processor.onaudioprocess = () => {
//     const currentlyMuted = micStreamGlobal.getAudioTracks().some(track => !track.enabled);
//     const targetGain = currentlyMuted ? 0 : 1;
    
//     // Smooth transition to avoid audio clicks
//     if (Math.abs(micGain.gain.value - targetGain) > 0.01) {
//       micGain.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.05);
//     }
//   };
  
//   // Keep processor active
//   micGain.connect(processor);
//   processor.connect(audioContext.destination);
  
//   // Create final mixed stream
//   finalStream = new MediaStream([
//     ...tabStream.getVideoTracks(),
//     destination.stream.getAudioTracks()[0]
//   ]);
  
//   console.log("✅ MUTE-AWARE MIXED STREAM CREATED");
// }

//     // Setup MediaRecorder
//     console.log("📹 Setting up MediaRecorder");
//     console.log("📊 Final stream tracks - Video:", finalStream.getVideoTracks().length, "Audio:", finalStream.getAudioTracks().length);
    
//     const mimeTypes = [
//       'video/webm;codecs=vp9,opus',
//       'video/webm;codecs=vp8,opus', 
//       'video/webm;codecs=h264,opus',
//       'video/webm'
//     ];

//     let supportedType = 'video/webm';
//     for (const type of mimeTypes) {
//       if (MediaRecorder.isTypeSupported(type)) {
//         supportedType = type;
//         console.log("✅ Supported MIME type found:", supportedType);
//         break;
//       }
//     }
    
//     console.log("🎥 Using MIME type:", supportedType);

//     try {
//       mediaRecorder = new MediaRecorder(finalStream, {
//         mimeType: supportedType,
//         videoBitsPerSecond: 2500000,
//         audioBitsPerSecond: 128000
//       });
//       console.log("✅ MediaRecorder created successfully");
//     } catch (recordError) {
//       console.error("❌ Failed to create MediaRecorder:", recordError);
//       // Fallback: try without MIME type
//       console.warn("⚠️ Trying MediaRecorder without MIME type...");
//       try {
//         mediaRecorder = new MediaRecorder(finalStream);
//         console.log("✅ MediaRecorder created (no MIME type)");
//       } catch (fallbackError) {
//         console.error("❌ Failed to create MediaRecorder even without MIME type:", fallbackError);
//         throw new Error("Cannot create MediaRecorder: " + fallbackError.message);
//       }
//     }

//     recordedChunks = [];
//     isRecording = true;
//     recordingStartTime = Date.now();
//     downloadCompleted = false;

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunks.push(event.data);
//         console.log("📦 Data chunk:", event.data.size, "bytes, total chunks:", recordedChunks.length);
//       }
//     };

//     mediaRecorder.onstop = () => {
//       console.log("🛑 Recording stopped, total chunks:", recordedChunks.length);
//       stopTimer();
//       downloadRecording();
//     };

//     mediaRecorder.onerror = (event) => {
//       console.error("❌ MediaRecorder error:", event);
//       document.getElementById("status").textContent = "❌ Recording error";
//       cleanup();
//     };

//     // Start recording with 1-second chunks
//     mediaRecorder.start(1000);
//     console.log("✅ Recording started in background tab!");

//     // Update UI
//     document.getElementById("status").textContent = isAutoRecord 
//       ? "🟢 Auto Recording in background..." 
//       : "🟢 Recording in background...";
//     startTimer();

//     // Save recording state to storage
//     await chrome.storage.local.set({ 
//       isRecording: true,
//       recordingStartTime: recordingStartTime
//     });

//     // Notify background
//     chrome.runtime.sendMessage({ action: "recordingStarted" });

//   } catch (error) {
//     console.error("❌ Recording start FAILED with error:", error);
//     console.error("❌ Error name:", error.name);
//     console.error("❌ Error message:", error.message);
//     console.error("❌ Error stack:", error.stack);
    
//     document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
    
//     // Hide recording popup on error
//     chrome.runtime.sendMessage({ action: "hideRecordingPopup" });
    
//     // Show retry button for auto recordings
//     if (isAutoRecord) {
//       const retryButton = document.createElement('button');
//       retryButton.textContent = 'Retry Recording';
//       retryButton.style.cssText = `
//         padding: 10px 20px;
//         margin: 10px;
//         background: #4CAF50;
//         color: white;
//         border: none;
//         border-radius: 5px;
//         cursor: pointer;
//       `;
//       retryButton.onclick = () => startRecording(tabId);
//       document.body.appendChild(retryButton);
//     }
//   }
// }

// function stopRecording() {
//   console.log("🛑 STOP RECORDING called");
  
//   if (!mediaRecorder) return;
  
//   if (mediaRecorder.state === 'recording') {
//     isRecording = false;
//     mediaRecorder.stop();
//   }
  
//   chrome.runtime.sendMessage({ action: "hideRecordingPopup" });
// }

// function startTimer() {
//   let seconds = 0;
//   const timerEl = document.getElementById("timer");
  
//   if (timerInterval) clearInterval(timerInterval);
  
//   timerInterval = setInterval(() => {
//     seconds++;
//     const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
//     const secs = String(seconds % 60).padStart(2, "0");
//     const timeString = `${minutes}:${secs}`;
    
//     timerEl.textContent = timeString;
    
//     // Save time to storage
//     chrome.storage.local.set({ recordingTime: timeString });
    
//     // Send timer update to background and content script
//     chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
    
//     // Send timer update to content script for the popup
//     chrome.runtime.sendMessage({ 
//       action: "updateRecordingTimer", 
//       time: timeString 
//     });
//   }, 1000);
// }

// function stopTimer() {
//   if (timerInterval) {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }
// }

// function downloadRecording() {
//   console.log("💾💾💾 DOWNLOAD RECORDING CALLED 💾💾💾");
//   console.log("📊 Chunks available:", recordedChunks.length);
  
//   if (recordedChunks.length === 0) {
//     console.warn("⚠️ No recorded data - cannot download");
//     document.getElementById("status").textContent = "❌ No recording data to save";
//     cleanup();
//     return;
//   }

//   try {
//     console.log("💾 Creating Blob from", recordedChunks.length, "chunks");
    
//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     console.log("✅ Blob created, size:", blob.size, "bytes");
    
//     const url = URL.createObjectURL(blob);
//     const timestamp = new Date().toISOString()
//       .replace(/[:.]/g, '-')
//       .replace('T', '_')
//       .split('Z')[0];
//     const filename = `zoom-recording-${timestamp}.webm`;

//     console.log("💾 DOWNLOADING NOW:", filename);
//     console.log("📊 File size:", blob.size, "bytes");

//     // Download automatically without "Save As" popup
//     chrome.downloads.download({
//       url: url,
//       filename: filename
//     }, (downloadId) => {
//       if (chrome.runtime.lastError) {
//         console.error("❌ DOWNLOAD ERROR:", chrome.runtime.lastError);
//         document.getElementById("status").textContent = "❌ Download error: " + chrome.runtime.lastError.message;
//         fallbackDownload(blob, filename);
//       } else {
//         console.log("✅✅✅ DOWNLOAD STARTED WITH ID:", downloadId, "✅✅✅");
//         document.getElementById("status").textContent = "✅ Recording saved to Downloads!";
//         downloadCompleted = true;
        
//         // Mark chunks as downloaded to prevent redownload
//         recordedChunks = [];
        
//         // Cleanup after successful download
//         setTimeout(() => {
//           console.log("🧹 Cleaning up after download");
//           cleanup();
//         }, 2000);
//       }
//     });

//   } catch (error) {
//     console.error("Download failed:", error);
//     cleanup();
//   }
// }

// function cleanup() {
//   console.log("Cleanup");
//   isRecording = false;
//   recordedChunks = [];
  
//   if (timerInterval) clearInterval(timerInterval);
//   if (mediaRecorder && mediaRecorder.stream) {
//     mediaRecorder.stream.getTracks().forEach(t => t.stop());
//   }
  
//   chrome.storage.local.remove(['isRecording', 'recordingTime']);
//   chrome.runtime.sendMessage({ action: "recordingStopped" });
// }












// This runs in a separate tab that stays open for recording
let mediaRecorder;
let recordedChunks = [];
let micStreamGlobal = null;
let isRecording = false;
let timerInterval;
let recordingStartTime;
let isAutoRecord = false;
let downloadCompleted = false;

// Audio mixing variables
let audioContextRef = null;
let destinationNode = null;
let tabSourceNode = null;
let micSourceNode = null;
let micGainNode = null;
let mixedStream = null;
let isMuted = false;

console.log("🎬 Recorder tab loaded");

// SINGLE MESSAGE LISTENER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message received:", message.action);
  
  if (message.action === "startRecording") {
    console.log("🎬 START RECORDING");
    isAutoRecord = message.autoRecord || false;
    startRecording(message.tabId);
    sendResponse({ success: true });
  }
  else if (message.action === "stopRecording") {
    console.log("🛑 STOP RECORDING");
    stopRecording();
    sendResponse({ success: true });
  }
  else if (message.action === "zoomMuteChanged") {
    console.log("🎤 MUTE CHANGED:", message.muted ? "MUTED" : "UNMUTED");
    isMuted = message.muted;
    toggleMicrophone(!message.muted);
    sendResponse({ success: true });
  }
  
  return true;
});

// TOGGLE MICROPHONE ON/OFF
function toggleMicrophone(enable) {
  console.log(`🎤 toggleMicrophone called: enable=${enable}`);
  
  if (!micSourceNode || !destinationNode || !audioContextRef) {
    console.warn("⚠️ Audio nodes not ready");
    return;
  }
  
  try {
    if (enable) {
      // CONNECT mic to destination
      try {
        micSourceNode.connect(micGainNode);
        micGainNode.connect(destinationNode);
        console.log("✅ Microphone CONNECTED to audio mix");
      } catch (e) {
        console.log("ℹ️ Mic already connected");
      }
    } else {
      // DISCONNECT mic from destination
      try {
        micSourceNode.disconnect(micGainNode);
        micGainNode.disconnect(destinationNode);
        console.log("❌ Microphone DISCONNECTED from audio mix");
      } catch (e) {
        console.log("ℹ️ Mic already disconnected");
      }
    }
  } catch (error) {
    console.error("❌ Error toggling microphone:", error);
  }
}

// START RECORDING
async function startRecording(tabId) {
  console.log("🎬 Starting recording for tab:", tabId);
  
  if (isRecording) {
    console.log("⚠️ Already recording");
    return;
  }

  try {
    document.getElementById("status").textContent = "🟡 Starting...";
    chrome.runtime.sendMessage({ action: "showRecordingPopup" });

    // Get TAB stream
    const tabStream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({
        audio: true,
        video: true
      }, (stream) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!stream) {
          reject(new Error("No stream"));
          return;
        }
        console.log("✅ Tab stream captured");
        resolve(stream);
      });
    });

    // Get MIC stream
    try {
      console.log("🎤 Requesting microphone...");
      micStreamGlobal = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false
        }
      });
      console.log("✅ Microphone stream obtained");
    } catch (err) {
      console.warn("⚠️ No microphone, tab audio only");
      micStreamGlobal = null;
    }

    // CREATE AUDIO CONTEXT AND MIX
    audioContextRef = new AudioContext({ sampleRate: 48000 });
    destinationNode = audioContextRef.createMediaStreamDestination();

    // Tab audio ALWAYS connected
    tabSourceNode = audioContextRef.createMediaStreamSource(
      new MediaStream(tabStream.getAudioTracks())
    );
    tabSourceNode.connect(destinationNode);
    console.log("✅ Tab audio connected");

    // Mic audio with GAIN control
    // Mic audio with GAIN control - START MUTED BY DEFAULT
    if (micStreamGlobal) {
      micSourceNode = audioContextRef.createMediaStreamSource(micStreamGlobal);
      micGainNode = audioContextRef.createGain();
      micGainNode.gain.value = 1.0;
  
      // Connect mic → gain → destination
      micSourceNode.connect(micGainNode);
      micGainNode.connect(destinationNode);
  
      // START WITH MIC DISCONNECTED until we confirm unmuted state
      isMuted = true;  // Assume muted by default
      toggleMicrophone(false);  // Disconnect mic immediately
      console.log("✅ Mic audio connected but DISABLED by default (waiting for unmute confirmation)");
}

    // CREATE FINAL STREAM
    mixedStream = new MediaStream([
      ...tabStream.getVideoTracks(),
      ...destinationNode.stream.getAudioTracks()
    ]);

    console.log("📊 Final stream:", {
      videoTracks: mixedStream.getVideoTracks().length,
      audioTracks: mixedStream.getAudioTracks().length
    });

    // SETUP MEDIA RECORDER
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
      ? 'video/webm;codecs=vp9,opus' 
      : 'video/webm';

    mediaRecorder = new MediaRecorder(mixedStream, {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    });

    recordedChunks = [];
    isRecording = true;
    recordingStartTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped");
      stopTimer();
      downloadRecording();
      cleanup();
    };

    mediaRecorder.onerror = (event) => {
      console.error("❌ MediaRecorder error:", event);
      cleanup();
    };

    // START!
    mediaRecorder.start(1000);
    console.log("✅✅✅ RECORDING STARTED ✅✅✅");
    
    document.getElementById("status").textContent = isAutoRecord 
      ? "🟢 Auto Recording..." 
      : "🟢 Recording...";
    startTimer();

    await chrome.storage.local.set({ 
      isRecording: true,
      recordingStartTime: recordingStartTime
    });

    chrome.runtime.sendMessage({ action: "recordingStarted" });

  } catch (error) {
    console.error("❌ Failed:", error);
    document.getElementById("status").textContent = "❌ Failed: " + error.message;
    chrome.runtime.sendMessage({ action: "hideRecordingPopup" });
    cleanup();
  }
}

// CLEANUP
function cleanup() {
  console.log("🧹 Cleanup");
  
  if (tabSourceNode) {
    try { tabSourceNode.disconnect(); } catch(e) {}
    tabSourceNode = null;
  }
  
  if (micSourceNode) {
    try { micSourceNode.disconnect(); } catch(e) {}
    micSourceNode = null;
  }
  
  if (micGainNode) {
    try { micGainNode.disconnect(); } catch(e) {}
    micGainNode = null;
  }
  
  if (destinationNode) {
    try { destinationNode.disconnect(); } catch(e) {}
    destinationNode = null;
  }
  
  if (audioContextRef && audioContextRef.state !== 'closed') {
    audioContextRef.close().catch(console.error);
    audioContextRef = null;
  }
  
  if (micStreamGlobal) {
    micStreamGlobal.getTracks().forEach(track => track.stop());
    micStreamGlobal = null;
  }
  
  if (mixedStream) {
    mixedStream.getTracks().forEach(track => track.stop());
    mixedStream = null;
  }
  
  isMuted = false;
  console.log("✅ Cleanup complete");
}

function stopRecording() {
  console.log("🛑 STOP RECORDING called");
  
  if (!mediaRecorder || mediaRecorder.state !== 'recording') {
    console.warn("⚠️ Not recording");
    return;
  }
  
  isRecording = false;
  mediaRecorder.stop();
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
    chrome.storage.local.set({ recordingTime: timeString });
    chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function downloadRecording() {
  console.log("💾 Downloading...");
  
  if (recordedChunks.length === 0) {
    console.warn("⚠️ No data");
    return;
  }

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
  const filename = `zoom-recording-${timestamp}.webm`;

  chrome.downloads.download({
    url: url,
    filename: filename
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error("❌ Download error:", chrome.runtime.lastError);
      document.getElementById("status").textContent = "❌ Download failed";
    } else {
      console.log("✅ Downloaded:", downloadId);
      document.getElementById("status").textContent = "✅ Saved!";
      recordedChunks = [];
    }
  });
}