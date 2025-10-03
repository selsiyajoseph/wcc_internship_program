














// /// Background script - Message routing and tab detection
// let userPermissionGranted = false;
// let currentRecordingTab = null;

// // Load saved permission state
// chrome.storage.local.get(['autoRecordPermission'], (result) => {
//   userPermissionGranted = result.autoRecordPermission || false;
//   console.log("🔐 Auto record permission:", userPermissionGranted);
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && isTeamsTab(tab.url)) {
//     console.log("✅ Teams tab detected:", tabId, tab.url);
    
//     // Check if user has given permission for auto recording
//     chrome.storage.local.get(['autoRecordPermission'], (result) => {
//       if (result.autoRecordPermission) {
//         console.log("🎬 Auto recording permission granted - checking meeting status");
        
//         // Wait for content script to load and check meeting status
//         setTimeout(() => {
//           chrome.tabs.sendMessage(tabId, { 
//             action: "getMeetingStatus" 
//           }, (response) => {
//             if (chrome.runtime.lastError) {
//               console.log("⚠️ Content script not ready yet");
//               return;
//             }
            
//             if (response && response.isInMeeting && !response.recording) {
//               console.log("✅ Meeting detected - starting auto recording");
//               startRecordingForTab(tabId);
//             }
//           });
//         }, 3000);
//       }
//     });
//   }
// });

// function isTeamsTab(url) {
//   return url && (url.includes("teams.microsoft.com") || url.includes("teams.live.com"));
// }

// // Handle permission messages
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Background received:", message.action);
  
//   if (message.action === "grantAutoRecordPermission") {
//     console.log("✅ User granted auto recording permission");
//     userPermissionGranted = true;
//     chrome.storage.local.set({ autoRecordPermission: true }, () => {
//       // Notify all Teams tabs about permission change
//       chrome.tabs.query({url: ["https://*.teams.microsoft.com/*", "https://*.teams.live.com/*"]}, (tabs) => {
//         tabs.forEach(tab => {
//           chrome.tabs.sendMessage(tab.id, {
//             action: "updateAutoRecordPermission",
//             enabled: true
//           });
//         });
//       });
//     });
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "revokeAutoRecordPermission") {
//     console.log("❌ User revoked auto recording permission");
//     userPermissionGranted = false;
//     chrome.storage.local.set({ autoRecordPermission: false }, () => {
//       // Notify all Teams tabs about permission change
//       chrome.tabs.query({url: ["https://*.teams.microsoft.com/*", "https://*.teams.live.com/*"]}, (tabs) => {
//         tabs.forEach(tab => {
//           chrome.tabs.sendMessage(tab.id, {
//             action: "updateAutoRecordPermission",
//             enabled: false
//           });
//         });
//       });
//     });
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "getAutoRecordPermission") {
//     sendResponse({ permission: userPermissionGranted });
//   }

//   if (message.action === "autoStartRecording") {
//     console.log("🎬 Auto starting recording for tab:", sender.tab.id);
//     startRecordingForTab(sender.tab.id);
//     sendResponse({ success: true });
//   }

//   if (message.action === "autoStopRecording") {
//     console.log("🛑 Auto stopping recording");
//     stopAllRecordings();
//     sendResponse({ success: true });
//   }

//   if (message.action === "checkMeetingStatus") {
//     chrome.tabs.sendMessage(sender.tab.id, { action: "checkMeetingStatus" }, (response) => {
//       sendResponse(response);
//     });
//     return true;
//   }
  
//   return true;
// });

// function startRecordingForTab(tabId) {
//   if (currentRecordingTab) {
//     console.log("⚠️ Already recording in tab:", currentRecordingTab);
//     return;
//   }

//   console.log("🎬 Starting recording for Teams tab:", tabId);
//   currentRecordingTab = tabId;
  
//   // Create a new tab for recording
//   chrome.tabs.create({
//     url: chrome.runtime.getURL("recorder.html"),
//     active: false
//   }, (recorderTab) => {
//     console.log("✅ Recorder tab opened:", recorderTab.id);
    
//     // Send tab ID to recorder after a delay
//     setTimeout(() => {
//       chrome.tabs.sendMessage(recorderTab.id, { 
//         action: "startRecording", 
//         tabId: tabId,
//         autoRecord: true
//       }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.log("❌ Recorder tab not ready, retrying...");
//           setTimeout(() => {
//             chrome.tabs.sendMessage(recorderTab.id, { 
//               action: "startRecording", 
//               tabId: tabId,
//               autoRecord: true
//             });
//           }, 1000);
//         }
//       });
//     }, 1500);
//   });
// }

// function stopAllRecordings() {
//   console.log("🛑 Stopping all recordings");
//   currentRecordingTab = null;
  
//   // Find and stop all recorder tabs
//   chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") }, (tabs) => {
//     if (tabs.length > 0) {
//       tabs.forEach(tab => {
//         chrome.tabs.sendMessage(tab.id, { action: "stopRecording" });
//       });
//     } else {
//       console.log("⚠️ No recorder tabs found");
//     }
//   });
// }

// // Monitor tab closures
// chrome.tabs.onRemoved.addListener((tabId) => {
//   if (tabId === currentRecordingTab) {
//     console.log("🛑 Recording source tab closed - stopping recording");
//     stopAllRecordings();
//   }
// });

// // Keep service worker alive
// setInterval(() => {
//   chrome.runtime.getPlatformInfo(() => {});
// }, 20000);














/// Background script - Message routing and tab detection
let userPermissionGranted = false;
let currentRecordingTab = null;

// Load saved permission state
chrome.storage.local.get(['autoRecordPermission'], (result) => {
  userPermissionGranted = result.autoRecordPermission || false;
  console.log("🔐 Auto record permission:", userPermissionGranted);
});

// Listen for tab updates to detect Teams pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isTeamsTab(tab.url)) {
    console.log("✅ Teams tab detected:", tabId, tab.url);
    
    // Check if user has given permission for auto recording
    chrome.storage.local.get(['autoRecordPermission'], (result) => {
      if (result.autoRecordPermission) {
        console.log("🎬 Auto recording permission granted - waiting for meeting join...");
        
        // Don't start recording immediately, wait for leave button to appear
        // The content script will handle this
      }
    });
  }
});

function isTeamsTab(url) {
  return url && (url.includes("teams.microsoft.com") || url.includes("teams.live.com"));
}

// Handle permission messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Background received:", message.action);
  
  if (message.action === "grantAutoRecordPermission") {
    console.log("✅ User granted auto recording permission");
    userPermissionGranted = true;
    chrome.storage.local.set({ autoRecordPermission: true }, () => {
      // Notify all Teams tabs about permission change
      chrome.tabs.query({url: ["https://*.teams.microsoft.com/*", "https://*.teams.live.com/*"]}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "updateAutoRecordPermission",
            enabled: true
          });
        });
      });
    });
    sendResponse({ success: true });
  }
  
  if (message.action === "revokeAutoRecordPermission") {
    console.log("❌ User revoked auto recording permission");
    userPermissionGranted = false;
    chrome.storage.local.set({ autoRecordPermission: false }, () => {
      // Notify all Teams tabs about permission change
      chrome.tabs.query({url: ["https://*.teams.microsoft.com/*", "https://*.teams.live.com/*"]}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "updateAutoRecordPermission",
            enabled: false
          });
        });
      });
    });
    sendResponse({ success: true });
  }
  
  if (message.action === "getAutoRecordPermission") {
    sendResponse({ permission: userPermissionGranted });
  }

  if (message.action === "autoStartRecording") {
    console.log("🎬 Auto starting recording for tab:", sender.tab.id);
    startRecordingForTab(sender.tab.id);
    sendResponse({ success: true });
  }

  if (message.action === "autoStopRecording") {
    console.log("🛑 Auto stopping recording");
    stopAllRecordings();
    sendResponse({ success: true });
  }

  if (message.action === "checkMeetingStatus") {
    chrome.tabs.sendMessage(sender.tab.id, { action: "checkMeetingStatus" }, (response) => {
      sendResponse(response);
    });
    return true;
  }

  if (message.action === "recordingStarted") {
    console.log("✅ Recording started successfully");
    currentRecordingTab = sender.tab.id;
    sendResponse({ success: true });
  }

  if (message.action === "recordingStopped") {
    console.log("✅ Recording stopped successfully");
    currentRecordingTab = null;
    sendResponse({ success: true });
  }
  
  return true;
});

function startRecordingForTab(tabId) {
  if (currentRecordingTab) {
    console.log("⚠️ Already recording in tab:", currentRecordingTab);
    return;
  }

  console.log("🎬 Starting recording for Teams tab:", tabId);
  
  // Create a new tab for recording
  chrome.tabs.create({
    url: chrome.runtime.getURL("recorder.html"),
    active: false
  }, (recorderTab) => {
    console.log("✅ Recorder tab opened:", recorderTab.id);
    
    // Send tab ID to recorder after a delay
    const startRecording = (retryCount = 0) => {
      chrome.tabs.sendMessage(recorderTab.id, { 
        action: "startRecording", 
        tabId: tabId,
        autoRecord: true
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(`❌ Recorder tab not ready (attempt ${retryCount + 1}/3), retrying...`);
          if (retryCount < 2) {
            setTimeout(() => startRecording(retryCount + 1), 1000);
          } else {
            console.error("❌ Failed to start recording after 3 attempts");
          }
        } else {
          console.log("✅ Recording started successfully");
          currentRecordingTab = tabId;
        }
      });
    };
    
    setTimeout(() => startRecording(), 1500);
  });
}

function stopAllRecordings() {
  console.log("🛑 Stopping all recordings");
  
  // Find and stop all recorder tabs
  chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") }, (tabs) => {
    if (tabs.length > 0) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "stopRecording" });
      });
    } else {
      console.log("⚠️ No recorder tabs found");
    }
  });
  
  currentRecordingTab = null;
}

// Monitor tab closures
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentRecordingTab) {
    console.log("🛑 Recording source tab closed - stopping recording");
    stopAllRecordings();
  }
});

// Keep service worker alive
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {});
}, 20000);