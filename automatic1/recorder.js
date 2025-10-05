


















// /// This runs in a separate tab that stays open for recording
// let mediaRecorder;
// let recordedChunks = [];
// let isRecording = false;
// let timerInterval;
// let recordingStartTime;
// let isAutoRecord = false;

// console.log("🎬 Recorder tab loaded");

// // Listen for messages from popup
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Recorder received:", message.action);
  
//   if (message.action === "startRecording") {
//     isAutoRecord = message.autoRecord || false;
//     startRecording(message.tabId);
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "stopRecording") {
//     stopRecording();
//     sendResponse({ success: true });
//   }
  
//   return true;
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

//     // Get tab stream using the provided tabId
//     const tabStream = await new Promise((resolve, reject) => {
//       chrome.tabCapture.capture({
//         audio: true,
//         video: true,
//         audioConstraints: {
//           mandatory: {
//             chromeMediaSource: 'tab',
//             chromeMediaSourceId: tabId,
//             echoCancellation: true
//           }
//         },
//         videoConstraints: {
//           mandatory: {
//             chromeMediaSource: 'tab', 
//             chromeMediaSourceId: tabId,
//             minWidth: 1280,
//             minHeight: 720,
//             maxWidth: 1920,
//             maxHeight: 1080,
//             maxFrameRate: 30
//           }
//         }
//       }, (stream) => {
//         if (chrome.runtime.lastError) {
//           console.error("❌ Tab capture error:", chrome.runtime.lastError);
//           reject(new Error(chrome.runtime.lastError.message || "Tab capture failed"));
//           return;
//         }
//         if (!stream) {
//           reject(new Error("Could not capture tab stream - no stream returned"));
//           return;
//         }
//         console.log("✅ Tab stream captured successfully");
//         resolve(stream);
//       });
//     });

//     console.log("✅ Tab stream captured, tracks:", tabStream.getTracks().length);

//     let finalStream = tabStream;

//     // Try to add microphone audio
//     try {
//       console.log("🎤 Attempting to capture microphone...");
//       const micStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           sampleRate: 44100,
//           channelCount: 2
//         },
//         video: false
//       });

//       console.log("✅ Microphone captured");

//       // Mix audio using AudioContext
//       const audioContext = new AudioContext({ sampleRate: 44100 });
//       const destination = audioContext.createMediaStreamDestination();

//       const tabAudioSource = audioContext.createMediaStreamSource(
//         new MediaStream(tabStream.getAudioTracks())
//       );
//       const micAudioSource = audioContext.createMediaStreamSource(micStream);

//       tabAudioSource.connect(destination);
//       micAudioSource.connect(destination);

//       // Create final stream with mixed audio
//       finalStream = new MediaStream([
//         ...tabStream.getVideoTracks(),
//         ...destination.stream.getAudioTracks()
//       ]);

//       console.log("✅ Audio mixed successfully");

//     } catch (micError) {
//       console.warn("⚠️ Microphone not available, using tab audio only:", micError);
//       // Continue with tab audio only
//       finalStream = tabStream;
//     }

//     // Setup MediaRecorder
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
//         break;
//       }
//     }
    
//     console.log("🎥 Using MIME type:", supportedType);

//     mediaRecorder = new MediaRecorder(finalStream, {
//       mimeType: supportedType,
//       videoBitsPerSecond: 2500000,
//       audioBitsPerSecond: 128000
//     });

//     recordedChunks = [];
//     isRecording = true;
//     recordingStartTime = Date.now();

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
//       cleanup();
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
//     console.error("❌ Recording start failed:", error);
//     document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
    
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

// // Rest of the functions remain the same...
// function stopRecording() {
//   if (mediaRecorder && isRecording) {
//     console.log("🛑 Stopping recording...");
//     mediaRecorder.stop();
//   } else {
//     console.log("⚠️ No active recording to stop");
//   }
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
    
//     // Send timer update
//     chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
//   }, 1000);
// }

// function stopTimer() {
//   if (timerInterval) {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }
// }

// function downloadRecording() {
//   if (recordedChunks.length === 0) {
//     console.warn("⚠️ No recorded data");
//     document.getElementById("status").textContent = "❌ No recording data";
//     return;
//   }

//   try {
//     console.log("💾 Preparing download, chunks:", recordedChunks.length);
    
//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     const url = URL.createObjectURL(blob);
//     const timestamp = new Date().toISOString()
//       .replace(/[:.]/g, '-')
//       .replace('T', '_')
//       .split('Z')[0];
//     const filename = `teams-recording-${timestamp}.webm`;

//     console.log("💾 Downloading:", filename);

//     chrome.downloads.download({
//       url: url,
//       filename: filename,
//       saveAs: true
//     }, (downloadId) => {
//       if (chrome.runtime.lastError) {
//         console.error("❌ Download error:", chrome.runtime.lastError);
//         fallbackDownload(blob, filename);
//       } else {
//         console.log("✅ Download started with ID:", downloadId);
//         document.getElementById("status").textContent = "✅ Recording saved!";
//       }
//     });

//   } catch (error) {
//     console.error("❌ Download failed:", error);
//     document.getElementById("status").textContent = "❌ Download failed";
//   }
// }

// function fallbackDownload(blob, filename) {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
  
//   setTimeout(() => URL.revokeObjectURL(url), 60000);
//   document.getElementById("status").textContent = "✅ Recording saved!";
// }

// function cleanup() {
//   isRecording = false;
  
//   if (timerInterval) {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }

//   if (mediaRecorder && mediaRecorder.stream) {
//     mediaRecorder.stream.getTracks().forEach(track => {
//       track.stop();
//       console.log("🛑 Stopped track:", track.kind);
//     });
//   }
  
//   recordedChunks = [];
  
//   // Clear storage
//   chrome.storage.local.remove(['isRecording', 'recordingTime', 'recordingStartTime']);
  
//   // Notify background
//   chrome.runtime.sendMessage({ action: "recordingStopped" });
  
//   document.getElementById("status").textContent = "✅ Recording completed";
  
//   // Close this tab after delay for auto recordings
//   if (isAutoRecord) {
//     setTimeout(() => {
//       window.close();
//     }, 5000);
//   }
// }

// // Keep this tab alive
// setInterval(() => {
//   if (isRecording) {
//     console.log("💓 Recorder tab keep-alive");
//   }
// }, 30000);





/// This runs in a separate tab that stays open for recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let timerInterval;
let recordingStartTime;
let isAutoRecord = false;

console.log("🎬 Recorder tab loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Recorder received:", message.action);
  
  if (message.action === "startRecording") {
    isAutoRecord = message.autoRecord || false;
    startRecording(message.tabId);
    sendResponse({ success: true });
  }
  
  if (message.action === "stopRecording") {
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

    // Get tab stream using the provided tabId
    const tabStream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({
        audio: true,
        video: true,
        audioConstraints: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: tabId,
            echoCancellation: true
          }
        },
        videoConstraints: {
          mandatory: {
            chromeMediaSource: 'tab', 
            chromeMediaSourceId: tabId,
            minWidth: 1280,
            minHeight: 720,
            maxWidth: 1920,
            maxHeight: 1080,
            maxFrameRate: 30
          }
        }
      }, (stream) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Tab capture error:", chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message || "Tab capture failed"));
          return;
        }
        if (!stream) {
          reject(new Error("Could not capture tab stream - no stream returned"));
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
        break;
      }
    }
    
    console.log("🎥 Using MIME type:", supportedType);

    mediaRecorder = new MediaRecorder(finalStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    });

    recordedChunks = [];
    isRecording = true;
    recordingStartTime = Date.now();

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
      cleanup();
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
    console.error("❌ Recording start failed:", error);
    document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
    
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
  if (mediaRecorder && isRecording) {
    console.log("🛑 Stopping recording...");
    mediaRecorder.stop();
  } else {
    console.log("⚠️ No active recording to stop");
  }
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
    
    // Send timer update
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
  if (recordedChunks.length === 0) {
    console.warn("⚠️ No recorded data");
    document.getElementById("status").textContent = "❌ No recording data";
    return;
  }

  try {
    console.log("💾 Preparing download, chunks:", recordedChunks.length);
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('Z')[0];
    const filename = `teams-recording-${timestamp}.webm`;

    console.log("💾 Downloading:", filename);

    // Download automatically without "Save As" popup
    chrome.downloads.download({
      url: url,
      filename: filename
      // saveAs: true removed for automatic download
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Download error:", chrome.runtime.lastError);
        fallbackDownload(blob, filename);
      } else {
        console.log("✅ Download started with ID:", downloadId);
        document.getElementById("status").textContent = "✅ Recording saved to Downloads!";
      }
    });

  } catch (error) {
    console.error("❌ Download failed:", error);
    document.getElementById("status").textContent = "❌ Download failed";
  }
}

function fallbackDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  document.getElementById("status").textContent = "✅ Recording saved to Downloads!";
}

function cleanup() {
  isRecording = false;
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(track => {
      track.stop();
      console.log("🛑 Stopped track:", track.kind);
    });
  }
  
  recordedChunks = [];
  
  // Clear storage
  chrome.storage.local.remove(['isRecording', 'recordingTime', 'recordingStartTime']);
  
  // Notify background
  chrome.runtime.sendMessage({ action: "recordingStopped" });
  
  document.getElementById("status").textContent = "✅ Recording completed and downloaded";
  
  // Close this tab after delay for auto recordings
  if (isAutoRecord) {
    setTimeout(() => {
      window.close();
    }, 3000);
  }
}

// Keep this tab alive
setInterval(() => {
  if (isRecording) {
    console.log("💓 Recorder tab keep-alive");
  }
}, 30000);