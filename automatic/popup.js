// // let activeTabId;
// // let isRecording = false;
// // let autoRecordEnabled = false;

// // // Check current tab on popup open
// // document.addEventListener("DOMContentLoaded", async () => {
// //   console.log("🔍 Popup opened - checking tab...");
  
// //   try {
// //     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
// //     if (tab && tab.url && /https:\/\/.*teams.*\.com/.test(tab.url)) {
// //       activeTabId = tab.id;
// //       console.log("✅ Teams tab detected:", activeTabId);
// //     }

// //     // Check current recording status and permission
// //     await checkRecordingStatus();
// //     await checkAutoRecordPermission();
    
// //   } catch (error) {
// //     console.error("❌ Error checking tab:", error);
// //   }
// // });

// // // Check auto record permission
// // async function checkAutoRecordPermission() {
// //   try {
// //     const result = await chrome.storage.local.get(['autoRecordPermission']);
// //     autoRecordEnabled = result.autoRecordPermission || false;
    
// //     // Update toggle UI
// //     document.getElementById('autoRecordToggle').checked = autoRecordEnabled;
// //     document.getElementById('toggleLabel').textContent = autoRecordEnabled ? 'ON' : 'OFF';
// //     document.getElementById('permissionText').textContent = autoRecordEnabled 
// //       ? 'Auto recording enabled ✅' 
// //       : 'Automatically record when joining meetings';
      
// //     console.log("🔐 Auto record permission:", autoRecordEnabled);
// //   } catch (error) {
// //     console.error("❌ Error checking permission:", error);
// //   }
// // }

// // // Auto record toggle handler
// // document.getElementById('autoRecordToggle').addEventListener('change', async (e) => {
// //   const enabled = e.target.checked;
  
// //   if (enabled) {
// //     // Ask for user confirmation
// //     const confirmed = confirm(`Enable Auto Recording?\n\nThis will automatically start recording when you join any Teams meeting. You can disable this anytime in the extension.`);
    
// //     if (confirmed) {
// //       await chrome.runtime.sendMessage({ action: "grantAutoRecordPermission" });
// //       autoRecordEnabled = true;
// //       document.getElementById('toggleLabel').textContent = 'ON';
// //       document.getElementById('permissionText').textContent = 'Auto recording enabled ✅';
// //       console.log("✅ Auto recording enabled");
// //     } else {
// //       e.target.checked = false;
// //     }
// //   } else {
// //     await chrome.runtime.sendMessage({ action: "revokeAutoRecordPermission" });
// //     autoRecordEnabled = false;
// //     document.getElementById('toggleLabel').textContent = 'OFF';
// //     document.getElementById('permissionText').textContent = 'Automatically record when joining meetings';
// //     console.log("❌ Auto recording disabled");
// //   }
// // });

// // // Check recording status
// // async function checkRecordingStatus() {
// //   try {
// //     const result = await chrome.storage.local.get(['isRecording', 'recordingTime']);
// //     isRecording = result.isRecording || false;
    
// //     if (isRecording) {
// //       updateUIForRecording(result.recordingTime || "00:00");
// //       console.log("✅ Recording active in background");
// //     } else {
// //       updateUIForReady();
// //       console.log("✅ Ready to record");
// //     }
// //   } catch (error) {
// //     console.error("❌ Error checking recording status:", error);
// //     updateUIForReady();
// //   }
// // }

// // function updateUIForRecording(recordingTime) {
// //   document.getElementById("startBtn").disabled = true;
// //   document.getElementById("stopBtn").disabled = false;
// //   document.getElementById("timer").textContent = recordingTime;
// //   document.getElementById("status").textContent = "🟢 Recording in background...";
// //   document.getElementById("startBtn").textContent = "Recording...";
// //   document.getElementById("warning").style.display = "none";
// // }

// // function updateUIForReady() {
// //   document.getElementById("startBtn").disabled = !activeTabId;
// //   document.getElementById("stopBtn").disabled = true;
// //   document.getElementById("timer").textContent = "00:00";
// //   document.getElementById("status").textContent = activeTabId ? "✅ Ready to record" : "❌ Please open Microsoft Teams";
// //   document.getElementById("startBtn").textContent = "Start Recording";
// //   document.getElementById("warning").style.display = "block";
// // }

// // // Start Recording - Open new tab for recording
// // document.getElementById("startBtn").addEventListener("click", async () => {
// //   console.log("🎬 Start recording clicked");
  
// //   if (!activeTabId) {
// //     alert("❌ Please open Microsoft Teams first");
// //     return;
// //   }

// //   try {
// //     document.getElementById("startBtn").disabled = true;
// //     document.getElementById("startBtn").textContent = "Starting...";
// //     document.getElementById("status").textContent = "🟡 Starting recording...";

// //     // Create a new tab for recording (this will keep recording alive)
// //     chrome.tabs.create({
// //       url: chrome.runtime.getURL("recorder.html"),
// //       active: false // Open in background
// //     }, (tab) => {
// //       console.log("✅ Recorder tab opened:", tab.id);
      
// //       // Send tab ID to recorder after a delay
// //       setTimeout(() => {
// //         chrome.tabs.sendMessage(tab.id, { 
// //           action: "startRecording", 
// //           tabId: activeTabId 
// //         });
// //       }, 1000);
// //     });

// //   } catch (error) {
// //     console.error("❌ Start recording failed:", error);
// //     document.getElementById("status").textContent = "❌ Failed to start";
// //     alert("Failed to start recording: " + error.message);
// //     updateUIForReady();
// //   }
// // });

// // // Stop Recording
// // document.getElementById("stopBtn").addEventListener("click", async () => {
// //   console.log("🛑 Stop recording clicked");
  
// //   try {
// //     document.getElementById("stopBtn").disabled = true;
// //     document.getElementById("stopBtn").textContent = "Stopping...";
// //     document.getElementById("status").textContent = "🟡 Stopping recording...";

// //     // Find and stop the recorder tab
// //     const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") });
// //     if (tabs.length > 0) {
// //       chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" });
// //     } else {
// //       // If recorder tab not found, clear storage
// //       await chrome.storage.local.remove(['isRecording', 'recordingTime']);
// //       updateUIForReady();
// //     }
    
// //   } catch (error) {
// //     console.error("❌ Stop recording failed:", error);
// //     document.getElementById("status").textContent = "❌ Stop failed";
// //     alert("Failed to stop recording: " + error.message);
// //     updateUIForReady();
// //   }
// // });

// // // Listen for updates from recorder tab
// // chrome.runtime.onMessage.addListener((message) => {
// //   if (message.action === "timerUpdate") {
// //     document.getElementById("timer").textContent = message.time;
// //   }
  
// //   if (message.action === "recordingStarted") {
// //     isRecording = true;
// //     updateUIForRecording("00:00");
// //   }
  
// //   if (message.action === "recordingStopped") {
// //     isRecording = false;
// //     updateUIForReady();
// //   }
// // });













// let activeTabId;
// let isRecording = false;
// let autoRecordEnabled = false;

// // Check current tab on popup open
// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("🔍 Popup opened - checking tab...");
  
//   try {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
//     if (tab && tab.url && isTeamsTab(tab.url)) {
//       activeTabId = tab.id;
//       console.log("✅ Teams tab detected:", activeTabId);
      
//       // Check meeting status
//       chrome.tabs.sendMessage(activeTabId, { action: "checkMeetingStatus" }, (response) => {
//         if (response) {
//           updateMeetingStatusUI(response.isInMeeting, response.recording);
//         }
//       });
//     }

//     // Check current recording status and permission
//     await checkRecordingStatus();
//     await checkAutoRecordPermission();
    
//   } catch (error) {
//     console.error("❌ Error checking tab:", error);
//   }
// });

// function isTeamsTab(url) {
//   return url && (url.includes("teams.microsoft.com") || url.includes("teams.live.com"));
// }

// function updateMeetingStatusUI(isInMeeting, isRecording) {
//   const statusElement = document.getElementById("status");
  
//   if (isInMeeting) {
//     if (isRecording) {
//       statusElement.textContent = "🟢 In Meeting - Recording...";
//       statusElement.style.color = "#4CAF50";
//     } else {
//       statusElement.textContent = "🟡 In Meeting - Ready to Record";
//       statusElement.style.color = "#FF9800";
//     }
//   } else {
//     statusElement.textContent = "⚪ Not in Meeting";
//     statusElement.style.color = "#9E9E9E";
//   }
// }

// // Check auto record permission
// async function checkAutoRecordPermission() {
//   try {
//     const result = await chrome.storage.local.get(['autoRecordPermission']);
//     autoRecordEnabled = result.autoRecordPermission || false;
    
//     // Update toggle UI
//     document.getElementById('autoRecordToggle').checked = autoRecordEnabled;
//     document.getElementById('toggleLabel').textContent = autoRecordEnabled ? 'ON' : 'OFF';
//     document.getElementById('permissionText').textContent = autoRecordEnabled 
//       ? 'Auto recording enabled ✅' 
//       : 'Automatically record when joining meetings';
      
//     console.log("🔐 Auto record permission:", autoRecordEnabled);
//   } catch (error) {
//     console.error("❌ Error checking permission:", error);
//   }
// }

// // Auto record toggle handler
// document.getElementById('autoRecordToggle').addEventListener('change', async (e) => {
//   const enabled = e.target.checked;
  
//   if (enabled) {
//     // Ask for user confirmation
//     const confirmed = confirm(`Enable Auto Recording?\n\nThis will automatically start recording when the "Leave" button appears (when you join a meeting) and stop when it disappears (when you leave).\n\nYou can disable this anytime in the extension.`);
    
//     if (confirmed) {
//       try {
//         await chrome.runtime.sendMessage({ action: "grantAutoRecordPermission" });
//         autoRecordEnabled = true;
//         document.getElementById('toggleLabel').textContent = 'ON';
//         document.getElementById('permissionText').textContent = 'Auto recording enabled ✅';
//         console.log("✅ Auto recording enabled");
        
//         // Show success message
//         showPopupMessage("Auto recording enabled! 🎬", "success");
//       } catch (error) {
//         console.error("❌ Failed to enable auto recording:", error);
//         e.target.checked = false;
//         showPopupMessage("Failed to enable auto recording", "error");
//       }
//     } else {
//       e.target.checked = false;
//     }
//   } else {
//     try {
//       await chrome.runtime.sendMessage({ action: "revokeAutoRecordPermission" });
//       autoRecordEnabled = false;
//       document.getElementById('toggleLabel').textContent = 'OFF';
//       document.getElementById('permissionText').textContent = 'Automatically record when joining meetings';
//       console.log("❌ Auto recording disabled");
      
//       // Show disabled message
//       showPopupMessage("Auto recording disabled", "info");
//     } catch (error) {
//       console.error("❌ Failed to disable auto recording:", error);
//       e.target.checked = true;
//       showPopupMessage("Failed to disable auto recording", "error");
//     }
//   }
// });

// // Check recording status
// async function checkRecordingStatus() {
//   try {
//     const result = await chrome.storage.local.get(['isRecording', 'recordingTime']);
//     isRecording = result.isRecording || false;
    
//     if (isRecording) {
//       updateUIForRecording(result.recordingTime || "00:00");
//       console.log("✅ Recording active in background");
//     } else {
//       updateUIForReady();
//       console.log("✅ Ready to record");
//     }
//   } catch (error) {
//     console.error("❌ Error checking recording status:", error);
//     updateUIForReady();
//   }
// }

// function updateUIForRecording(recordingTime) {
//   document.getElementById("startBtn").disabled = true;
//   document.getElementById("stopBtn").disabled = false;
//   document.getElementById("timer").textContent = recordingTime;
//   document.getElementById("status").textContent = "🟢 Recording in background...";
//   document.getElementById("startBtn").textContent = "Recording...";
//   document.getElementById("warning").style.display = "block";
  
//   // Update button styles
//   document.getElementById("startBtn").style.backgroundColor = "#666";
//   document.getElementById("stopBtn").style.backgroundColor = "#f44336";
// }

// function updateUIForReady() {
//   document.getElementById("startBtn").disabled = !activeTabId;
//   document.getElementById("stopBtn").disabled = true;
//   document.getElementById("timer").textContent = "00:00";
  
//   if (activeTabId) {
//     document.getElementById("status").textContent = "✅ Ready to record";
//   } else {
//     document.getElementById("status").textContent = "❌ Please open Microsoft Teams";
//   }
  
//   document.getElementById("startBtn").textContent = "Start Recording";
//   document.getElementById("warning").style.display = activeTabId ? "block" : "none";
  
//   // Update button styles
//   document.getElementById("startBtn").style.backgroundColor = activeTabId ? "#4CAF50" : "#666";
//   document.getElementById("stopBtn").style.backgroundColor = "#666";
// }

// // Start Recording - Open new tab for recording
// document.getElementById("startBtn").addEventListener("click", async () => {
//   console.log("🎬 Start recording clicked");
  
//   if (!activeTabId) {
//     alert("❌ Please open Microsoft Teams first");
//     return;
//   }

//   try {
//     document.getElementById("startBtn").disabled = true;
//     document.getElementById("startBtn").textContent = "Starting...";
//     document.getElementById("status").textContent = "🟡 Starting recording...";

//     // Create a new tab for recording (this will keep recording alive)
//     chrome.tabs.create({
//       url: chrome.runtime.getURL("recorder.html"),
//       active: false // Open in background
//     }, (tab) => {
//       console.log("✅ Recorder tab opened:", tab.id);
      
//       // Send tab ID to recorder after a delay
//       setTimeout(() => {
//         chrome.tabs.sendMessage(tab.id, { 
//           action: "startRecording", 
//           tabId: activeTabId 
//         }, (response) => {
//           if (chrome.runtime.lastError) {
//             console.error("❌ Failed to start recording:", chrome.runtime.lastError);
//             document.getElementById("status").textContent = "❌ Failed to start recording";
//             updateUIForReady();
//             showPopupMessage("Failed to start recording", "error");
//           }
//         });
//       }, 1000);
//     });

//   } catch (error) {
//     console.error("❌ Start recording failed:", error);
//     document.getElementById("status").textContent = "❌ Failed to start";
//     alert("Failed to start recording: " + error.message);
//     updateUIForReady();
//     showPopupMessage("Failed to start recording", "error");
//   }
// });

// // Stop Recording
// document.getElementById("stopBtn").addEventListener("click", async () => {
//   console.log("🛑 Stop recording clicked");
  
//   try {
//     document.getElementById("stopBtn").disabled = true;
//     document.getElementById("stopBtn").textContent = "Stopping...";
//     document.getElementById("status").textContent = "🟡 Stopping recording...";

//     // Find and stop the recorder tab
//     const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") });
//     if (tabs.length > 0) {
//       chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.error("❌ Failed to stop recording:", chrome.runtime.lastError);
//           document.getElementById("status").textContent = "❌ Stop failed";
//           showPopupMessage("Failed to stop recording", "error");
//         }
//       });
//     } else {
//       // If recorder tab not found, clear storage
//       await chrome.storage.local.remove(['isRecording', 'recordingTime']);
//       updateUIForReady();
//       console.log("⚠️ No recorder tab found");
//     }
    
//   } catch (error) {
//     console.error("❌ Stop recording failed:", error);
//     document.getElementById("status").textContent = "❌ Stop failed";
//     alert("Failed to stop recording: " + error.message);
//     updateUIForReady();
//     showPopupMessage("Failed to stop recording", "error");
//   }
// });

// // Show popup message
// function showPopupMessage(message, type = "info") {
//   // Remove existing message
//   const existingMessage = document.getElementById('popup-message');
//   if (existingMessage) {
//     existingMessage.remove();
//   }

//   const messageDiv = document.createElement('div');
//   messageDiv.id = 'popup-message';
//   messageDiv.style.cssText = `
//     position: fixed;
//     top: 10px;
//     left: 50%;
//     transform: translateX(-50%);
//     padding: 10px 15px;
//     border-radius: 5px;
//     font-size: 12px;
//     font-weight: bold;
//     z-index: 1000;
//     background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
//     color: white;
//     box-shadow: 0 2px 10px rgba(0,0,0,0.3);
//   `;
//   messageDiv.textContent = message;
  
//   document.body.appendChild(messageDiv);
  
//   // Auto remove after 3 seconds
//   setTimeout(() => {
//     if (messageDiv.parentNode) {
//       messageDiv.parentNode.removeChild(messageDiv);
//     }
//   }, 3000);
// }

// // Listen for updates from recorder tab
// chrome.runtime.onMessage.addListener((message) => {
//   console.log("📨 Popup received:", message.action);
  
//   if (message.action === "timerUpdate") {
//     document.getElementById("timer").textContent = message.time;
//   }
  
//   if (message.action === "recordingStarted") {
//     isRecording = true;
//     updateUIForRecording("00:00");
//     showPopupMessage("Recording started! 🎬", "success");
//   }
  
//   if (message.action === "recordingStopped") {
//     isRecording = false;
//     updateUIForReady();
//     showPopupMessage("Recording stopped - Downloading... 💾", "info");
//   }
// });

// // Refresh meeting status when popup is focused
// document.addEventListener('focus', () => {
//   if (activeTabId) {
//     chrome.tabs.sendMessage(activeTabId, { action: "checkMeetingStatus" }, (response) => {
//       if (response) {
//         updateMeetingStatusUI(response.isInMeeting, response.recording);
//       }
//     });
//   }
// });

// // Add some helpful tooltips
// document.addEventListener('DOMContentLoaded', () => {
//   // Add tooltip for auto recording
//   const toggleContainer = document.querySelector('.permission-toggle');
//   toggleContainer.title = "Automatically start/stop recording when join/leave meetings";
  
//   // Add tooltip for manual buttons
//   document.getElementById('startBtn').title = "Manually start recording current Teams tab";
//   document.getElementById('stopBtn').title = "Stop recording and download the video";
// });




let activeTabId;
let isRecording = false;
let autoRecordEnabled = false;

// Check current tab on popup open
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔍 Popup opened - checking tab...");
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && isTeamsTab(tab.url)) {
      activeTabId = tab.id;
      console.log("✅ Teams tab detected:", activeTabId);
      
      // Check meeting status
      chrome.tabs.sendMessage(activeTabId, { action: "checkMeetingStatus" }, (response) => {
        if (response) {
          updateMeetingStatusUI(response.isInMeeting, response.recording);
        }
      });
    }

    // Check current recording status and permission
    await checkRecordingStatus();
    await checkAutoRecordPermission();
    
  } catch (error) {
    console.error("❌ Error checking tab:", error);
  }
});

function isTeamsTab(url) {
  return url && (url.includes("teams.microsoft.com") || url.includes("teams.live.com"));
}

function updateMeetingStatusUI(isInMeeting, isRecording) {
  const statusElement = document.getElementById("status");
  
  if (isInMeeting) {
    if (isRecording) {
      statusElement.textContent = "🟢 In Meeting - Recording...";
      statusElement.style.color = "#4CAF50";
    } else {
      statusElement.textContent = "🟡 In Meeting - Ready to Record";
      statusElement.style.color = "#FF9800";
    }
  } else {
    statusElement.textContent = "⚪ Not in Meeting";
    statusElement.style.color = "#9E9E9E";
  }
}

// Check auto record permission
async function checkAutoRecordPermission() {
  try {
    const result = await chrome.storage.local.get(['autoRecordPermission']);
    autoRecordEnabled = result.autoRecordPermission || false;
    
    // Update toggle UI
    document.getElementById('autoRecordToggle').checked = autoRecordEnabled;
    document.getElementById('toggleLabel').textContent = autoRecordEnabled ? 'ON' : 'OFF';
    document.getElementById('permissionText').textContent = autoRecordEnabled 
      ? 'Auto recording enabled ✅' 
      : 'Automatically record when joining meetings';
      
    console.log("🔐 Auto record permission:", autoRecordEnabled);
  } catch (error) {
    console.error("❌ Error checking permission:", error);
  }
}

// Auto record toggle handler
document.getElementById('autoRecordToggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  
  if (enabled) {
    // Ask for user confirmation
    const confirmed = confirm(`Enable Auto Recording?\n\nThis will automatically start recording when the "Leave" button appears (when you join a meeting) and stop when it disappears (when you leave).\n\nYou can disable this anytime in the extension.`);
    
    if (confirmed) {
      try {
        await chrome.runtime.sendMessage({ action: "grantAutoRecordPermission" });
        autoRecordEnabled = true;
        document.getElementById('toggleLabel').textContent = 'ON';
        document.getElementById('permissionText').textContent = 'Auto recording enabled ✅';
        console.log("✅ Auto recording enabled");
        
        // Show success message
        showPopupMessage("Auto recording enabled! 🎬", "success");
      } catch (error) {
        console.error("❌ Failed to enable auto recording:", error);
        e.target.checked = false;
        showPopupMessage("Failed to enable auto recording", "error");
      }
    } else {
      e.target.checked = false;
    }
  } else {
    try {
      await chrome.runtime.sendMessage({ action: "revokeAutoRecordPermission" });
      autoRecordEnabled = false;
      document.getElementById('toggleLabel').textContent = 'OFF';
      document.getElementById('permissionText').textContent = 'Automatically record when joining meetings';
      console.log("❌ Auto recording disabled");
      
      // Show disabled message
      showPopupMessage("Auto recording disabled", "info");
    } catch (error) {
      console.error("❌ Failed to disable auto recording:", error);
      e.target.checked = true;
      showPopupMessage("Failed to disable auto recording", "error");
    }
  }
});

// Check recording status
async function checkRecordingStatus() {
  try {
    const result = await chrome.storage.local.get(['isRecording', 'recordingTime']);
    isRecording = result.isRecording || false;
    
    if (isRecording) {
      updateUIForRecording(result.recordingTime || "00:00");
      console.log("✅ Recording active in background");
    } else {
      updateUIForReady();
      console.log("✅ Ready to record");
    }
  } catch (error) {
    console.error("❌ Error checking recording status:", error);
    updateUIForReady();
  }
}

function updateUIForRecording(recordingTime) {
  document.getElementById("startBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("timer").textContent = recordingTime;
  document.getElementById("status").textContent = "🟢 Recording in background...";
  document.getElementById("startBtn").textContent = "Recording...";
  document.getElementById("warning").style.display = "block";
  
  // Update button styles
  document.getElementById("startBtn").style.backgroundColor = "#666";
  document.getElementById("stopBtn").style.backgroundColor = "#f44336";
}

function updateUIForReady() {
  document.getElementById("startBtn").disabled = !activeTabId;
  document.getElementById("stopBtn").disabled = true;
  document.getElementById("timer").textContent = "00:00";
  
  if (activeTabId) {
    document.getElementById("status").textContent = "✅ Ready to record";
  } else {
    document.getElementById("status").textContent = "❌ Please open Microsoft Teams";
  }
  
  document.getElementById("startBtn").textContent = "Start Recording";
  document.getElementById("warning").style.display = activeTabId ? "block" : "none";
  
  // Update button styles
  document.getElementById("startBtn").style.backgroundColor = activeTabId ? "#4CAF50" : "#666";
  document.getElementById("stopBtn").style.backgroundColor = "#666";
}

// Start Recording - Open new tab for recording
document.getElementById("startBtn").addEventListener("click", async () => {
  console.log("🎬 Start recording clicked");
  
  if (!activeTabId) {
    alert("❌ Please open Microsoft Teams first");
    return;
  }

  try {
    document.getElementById("startBtn").disabled = true;
    document.getElementById("startBtn").textContent = "Starting...";
    document.getElementById("status").textContent = "🟡 Starting recording...";

    // Create a new tab for recording (this will keep recording alive)
    chrome.tabs.create({
      url: chrome.runtime.getURL("recorder.html"),
      active: false // Open in background
    }, (tab) => {
      console.log("✅ Recorder tab opened:", tab.id);
      
      // Send tab ID to recorder after a delay
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "startRecording", 
          tabId: activeTabId 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Failed to start recording:", chrome.runtime.lastError);
            document.getElementById("status").textContent = "❌ Failed to start recording";
            updateUIForReady();
            showPopupMessage("Failed to start recording", "error");
          }
        });
      }, 1000);
    });

  } catch (error) {
    console.error("❌ Start recording failed:", error);
    document.getElementById("status").textContent = "❌ Failed to start";
    alert("Failed to start recording: " + error.message);
    updateUIForReady();
    showPopupMessage("Failed to start recording", "error");
  }
});

// Stop Recording
document.getElementById("stopBtn").addEventListener("click", async () => {
  console.log("🛑 Stop recording clicked");
  
  try {
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("stopBtn").textContent = "Stopping...";
    document.getElementById("status").textContent = "🟡 Stopping recording...";

    // Find and stop the recorder tab
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Failed to stop recording:", chrome.runtime.lastError);
          document.getElementById("status").textContent = "❌ Stop failed";
          showPopupMessage("Failed to stop recording", "error");
        }
      });
    } else {
      // If recorder tab not found, clear storage
      await chrome.storage.local.remove(['isRecording', 'recordingTime']);
      updateUIForReady();
      console.log("⚠️ No recorder tab found");
    }
    
  } catch (error) {
    console.error("❌ Stop recording failed:", error);
    document.getElementById("status").textContent = "❌ Stop failed";
    alert("Failed to stop recording: " + error.message);
    updateUIForReady();
    showPopupMessage("Failed to stop recording", "error");
  }
});

// Show popup message
function showPopupMessage(message, type = "info") {
  // Remove existing message
  const existingMessage = document.getElementById('popup-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.id = 'popup-message';
  messageDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    z-index: 1000;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

// Listen for updates from recorder tab
chrome.runtime.onMessage.addListener((message) => {
  console.log("📨 Popup received:", message.action);
  
  if (message.action === "timerUpdate") {
    document.getElementById("timer").textContent = message.time;
  }
  
  if (message.action === "recordingStarted") {
    isRecording = true;
    updateUIForRecording("00:00");
    showPopupMessage("Recording started! 🎬", "success");
  }
  
  if (message.action === "recordingStopped") {
    isRecording = false;
    updateUIForReady();
    showPopupMessage("Recording completed! ✅ Downloaded automatically", "success");
  }
});

// Refresh meeting status when popup is focused
document.addEventListener('focus', () => {
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, { action: "checkMeetingStatus" }, (response) => {
      if (response) {
        updateMeetingStatusUI(response.isInMeeting, response.recording);
      }
    });
  }
});

// Add some helpful tooltips
document.addEventListener('DOMContentLoaded', () => {
  // Add tooltip for auto recording
  const toggleContainer = document.querySelector('.permission-toggle');
  toggleContainer.title = "Automatically start/stop recording when join/leave meetings";
  
  // Add tooltip for manual buttons
  document.getElementById('startBtn').title = "Manually start recording current Teams tab";
  document.getElementById('stopBtn').title = "Stop recording and download the video";
});