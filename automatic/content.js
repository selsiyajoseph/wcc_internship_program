















// // Teams meeting detection and automatic recording control
// let isInMeeting = false;
// let recordingStarted = false;
// let autoRecordEnabled = false;

// // Check auto record permission on load
// checkAutoRecordPermission();

// async function checkAutoRecordPermission() {
//   return new Promise((resolve) => {
//     chrome.storage.local.get(['autoRecordPermission'], (result) => {
//       autoRecordEnabled = result.autoRecordPermission || false;
//       console.log("🔐 Auto record enabled:", autoRecordEnabled);
//       resolve(autoRecordEnabled);
//     });
//   });
// }

// function checkMeetingState() {
//   const url = window.location.href;
//   const wasInMeeting = isInMeeting;

//   // Check if in meeting by URL patterns
//   isInMeeting = url.includes("teams.live.com/v2/") || 
//                 (url.includes("teams.microsoft.com") && url.includes("meeting"));

//   // Check for leave button presence as additional indicator
//   const leaveButton = document.getElementById("hangup-button") || 
//                      document.querySelector('[data-tid="hangup-button"]') ||
//                      document.querySelector('[aria-label*="Leave"]') ||
//                      document.querySelector('[title*="Leave"]') ||
//                      document.querySelector('button[aria-label*="hang up"]') ||
//                      document.querySelector('button[title*="Leave call"]');

//   if (leaveButton && leaveButton.offsetParent !== null) {
//     isInMeeting = true;
//     console.log("✅ Leave button found - In meeting");
//   }

//   // Check for meeting indicators
//   const videoButton = document.querySelector('button[aria-label*="Turn on camera"]') ||
//                      document.querySelector('button[title*="camera"]');
  
//   const muteButton = document.querySelector('button[aria-label*="Mute"]') ||
//                     document.querySelector('button[title*="mute"]');

//   if ((videoButton || muteButton) && !isInMeeting) {
//     isInMeeting = true;
//     console.log("✅ Meeting controls found - In meeting");
//   }

//   // State change detection - Only auto record if permission granted
//   if (isInMeeting && !wasInMeeting && autoRecordEnabled && !recordingStarted) {
//     console.log("✅ Meeting joined - Auto starting recording");
//     startAutoRecording();
//   } else if (!isInMeeting && wasInMeeting && recordingStarted) {
//     console.log("❌ Meeting left - Auto stopping recording");
//     stopAutoRecording();
//   }

//   // Update meeting status in storage
//   chrome.storage.local.set({ isInMeeting: isInMeeting });
// }

// function startAutoRecording() {
//   if (recordingStarted) return;
  
//   console.log("🎬 Attempting auto recording start...");
//   recordingStarted = true;
  
//   // Send message to background to start recording
//   chrome.runtime.sendMessage({ 
//     action: "autoStartRecording"
//   }, (response) => {
//     if (response && response.success) {
//       console.log("✅ Auto recording started successfully");
      
//       // Show recording started notification
//       showRecordingNotification("started");
//     } else {
//       console.log("❌ Auto recording failed to start");
//       recordingStarted = false;
//     }
//   });
// }

// function stopAutoRecording() {
//   if (!recordingStarted) return;
  
//   console.log("🛑 Attempting auto recording stop...");
  
//   // Send message to background to stop recording
//   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
//     if (response && response.success) {
//       console.log("✅ Auto recording stopped successfully");
//       recordingStarted = false;
      
//       // Show recording stopped notification
//       showRecordingNotification("stopped");
//     } else {
//       console.log("❌ Auto recording failed to stop");
//     }
//   });
// }

// function showRecordingNotification(type) {
//   const notification = document.createElement('div');
//   notification.style.cssText = `
//     position: fixed;
//     top: 20px;
//     right: 20px;
//     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
//     color: white;
//     padding: 15px 20px;
//     border-radius: 8px;
//     z-index: 10000;
//     font-family: Arial, sans-serif;
//     font-size: 14px;
//     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//   `;
//   notification.textContent = type === 'started' 
//     ? '🔴 Recording Started' 
//     : '⏹️ Recording Stopped - Downloading...';
  
//   document.body.appendChild(notification);
  
//   setTimeout(() => {
//     if (notification.parentNode) {
//       notification.parentNode.removeChild(notification);
//     }
//   }, 3000);
// }

// // Listen for auto recording messages
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Content script received:", message.action);
  
//   if (message.action === "startAutoRecording" && autoRecordEnabled && !recordingStarted) {
//     console.log("🎬 Starting auto recording from background");
//     startAutoRecording();
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "updateAutoRecordPermission") {
//     autoRecordEnabled = message.enabled;
//     console.log("🔐 Auto record permission updated:", autoRecordEnabled);
//     sendResponse({ success: true });
//   }

//   if (message.action === "checkMeetingStatus") {
//     sendResponse({ 
//       isInMeeting: isInMeeting, 
//       recording: recordingStarted,
//       autoRecordEnabled: autoRecordEnabled
//     });
//   }

//   if (message.action === "getMeetingStatus") {
//     checkMeetingState();
//     sendResponse({ 
//       isInMeeting: isInMeeting, 
//       recording: recordingStarted 
//     });
//   }
  
//   return true;
// });

// // Enhanced Mutation Observer to detect meeting state changes
// const observer = new MutationObserver((mutations) => {
//   let shouldCheck = false;
  
//   mutations.forEach((mutation) => {
//     // Check for added/removed nodes that might indicate meeting state change
//     if (mutation.type === 'childList') {
//       mutation.addedNodes.forEach(node => {
//         if (node.nodeType === 1) { // Element node
//           if (node.id === 'hangup-button' || 
//               node.getAttribute('data-tid') === 'hangup-button' ||
//               node.getAttribute('aria-label')?.includes('Leave') ||
//               node.getAttribute('title')?.includes('Leave')) {
//             shouldCheck = true;
//           }
//         }
//       });
//     }
    
//     // Check for attribute changes
//     if (mutation.type === 'attributes') {
//       if (mutation.attributeName === 'style' || 
//           mutation.attributeName === 'class' ||
//           mutation.attributeName === 'aria-hidden') {
//         shouldCheck = true;
//       }
//     }
//   });
  
//   if (shouldCheck) {
//     setTimeout(checkMeetingState, 1000);
//   }
// });

// // Start observing
// observer.observe(document.body, {
//   childList: true,
//   subtree: true,
//   attributes: true,
//   attributeFilter: ['style', 'class', 'aria-hidden', 'data-tid']
// });

// // Also check on URL changes
// let lastUrl = location.href;
// new MutationObserver(() => {
//   const url = location.href;
//   if (url !== lastUrl) {
//     lastUrl = url;
//     setTimeout(checkMeetingState, 2000);
//   }
// }).observe(document, { subtree: true, childList: true });

// // Check for meeting state every 3 seconds as backup
// setInterval(checkMeetingState, 3000);

// // Initial check after page load
// setTimeout(checkMeetingState, 2000);

// console.log("🔍 Teams Auto Recorder content script loaded");




















// Teams meeting detection and automatic recording control
let isInMeeting = false;
let recordingStarted = false;
let autoRecordEnabled = false;
let leaveButtonObserver = null;

// Check auto record permission on load
checkAutoRecordPermission();

async function checkAutoRecordPermission() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['autoRecordPermission'], (result) => {
      autoRecordEnabled = result.autoRecordPermission || false;
      console.log("🔐 Auto record enabled:", autoRecordEnabled);
      resolve(autoRecordEnabled);
    });
  });
}

function checkMeetingState() {
  const url = window.location.href;
  const wasInMeeting = isInMeeting;

  // Check for leave button presence as primary indicator
  const leaveButton = findLeaveButton();
  
  if (leaveButton && isElementVisible(leaveButton)) {
    if (!isInMeeting) {
      console.log("✅ Leave button visible - Meeting joined");
      isInMeeting = true;
      
      // Start recording only when leave button becomes visible
      if (autoRecordEnabled && !recordingStarted) {
        console.log("🎬 Starting recording because leave button is visible");
        startAutoRecording();
      }
    }
  } else {
    if (isInMeeting) {
      console.log("❌ Leave button hidden - Meeting ended");
      isInMeeting = false;
      
      // Stop recording when leave button disappears
      if (recordingStarted) {
        console.log("🛑 Stopping recording because leave button disappeared");
        stopAutoRecording();
      }
    }
  }

  // Update meeting status in storage
  chrome.storage.local.set({ isInMeeting: isInMeeting });
}

function findLeaveButton() {
  // Try multiple selectors for leave button
  const selectors = [
    '#hangup-button',
    '[data-tid="hangup-button"]',
    '[aria-label*="Leave"]',
    '[aria-label*="leave"]', 
    '[title*="Leave"]',
    '[title*="leave"]',
    'button[aria-label*="hang up"]',
    'button[title*="Leave call"]',
    'button[data-tid*="hangup"]',
    '.ts-calling-hold-button', // Teams specific
    '.call-controls [aria-label*="Leave"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log("🔍 Found leave button with selector:", selector);
      return element;
    }
  }
  
  return null;
}

function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         rect.width > 0 && 
         rect.height > 0 &&
         element.offsetParent !== null;
}

function startAutoRecording() {
  if (recordingStarted) return;
  
  console.log("🎬 Attempting auto recording start...");
  recordingStarted = true;
  
  // Send message to background to start recording
  chrome.runtime.sendMessage({ 
    action: "autoStartRecording"
  }, (response) => {
    if (response && response.success) {
      console.log("✅ Auto recording started successfully");
      showRecordingNotification("started");
    } else {
      console.log("❌ Auto recording failed to start");
      recordingStarted = false;
    }
  });
}

function stopAutoRecording() {
  if (!recordingStarted) return;
  
  console.log("🛑 Attempting auto recording stop...");
  
  // Send message to background to stop recording
  chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
    if (response && response.success) {
      console.log("✅ Auto recording stopped successfully");
      recordingStarted = false;
      showRecordingNotification("stopped");
    } else {
      console.log("❌ Auto recording failed to stop");
    }
  });
}

function showRecordingNotification(type) {
  // Remove existing notification
  const existingNotification = document.getElementById('teams-recorder-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'teams-recorder-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'started' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid ${type === 'started' ? '#45a049' : '#d32f2f'};
  `;
  notification.textContent = type === 'started' 
    ? '🔴 Recording Started - Meeting Joined' 
    : '⏹️ Recording Stopped - Meeting Ended';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Enhanced Mutation Observer specifically for leave button
function setupLeaveButtonObserver() {
  if (leaveButtonObserver) {
    leaveButtonObserver.disconnect();
  }

  leaveButtonObserver = new MutationObserver((mutations) => {
    let leaveButtonChanged = false;
    
    mutations.forEach((mutation) => {
      // Check for added/removed nodes
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.id === 'hangup-button' || 
            node.getAttribute('data-tid') === 'hangup-button' ||
            node.getAttribute('aria-label')?.toLowerCase().includes('leave') ||
            node.getAttribute('title')?.toLowerCase().includes('leave')
          )) {
            leaveButtonChanged = true;
          }
        });
        
        mutation.removedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.id === 'hangup-button' || 
            node.getAttribute('data-tid') === 'hangup-button'
          )) {
            leaveButtonChanged = true;
          }
        });
      }
      
      // Check for attribute changes on leave button
      if (mutation.type === 'attributes' && mutation.target) {
        const target = mutation.target;
        if (target.id === 'hangup-button' || 
            target.getAttribute('data-tid') === 'hangup-button' ||
            target.getAttribute('aria-label')?.toLowerCase().includes('leave') ||
            target.getAttribute('title')?.toLowerCase().includes('leave')) {
          
          if (mutation.attributeName === 'style' || 
              mutation.attributeName === 'class' ||
              mutation.attributeName === 'aria-hidden' ||
              mutation.attributeName === 'disabled') {
            leaveButtonChanged = true;
          }
        }
      }
    });
    
    if (leaveButtonChanged) {
      console.log("🔍 Leave button state changed, checking meeting status...");
      setTimeout(checkMeetingState, 500);
    }
  });

  // Start observing the entire document for leave button changes
  leaveButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'aria-hidden', 'disabled', 'data-tid']
  });
}

// Listen for auto recording messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Content script received:", message.action);
  
  if (message.action === "startAutoRecording" && autoRecordEnabled && !recordingStarted) {
    console.log("🎬 Starting auto recording from background");
    startAutoRecording();
    sendResponse({ success: true });
  }
  
  if (message.action === "updateAutoRecordPermission") {
    autoRecordEnabled = message.enabled;
    console.log("🔐 Auto record permission updated:", autoRecordEnabled);
    
    // If permission enabled and in meeting, start recording
    if (autoRecordEnabled && isInMeeting && !recordingStarted) {
      setTimeout(startAutoRecording, 1000);
    }
    
    sendResponse({ success: true });
  }

  if (message.action === "checkMeetingStatus") {
    sendResponse({ 
      isInMeeting: isInMeeting, 
      recording: recordingStarted,
      autoRecordEnabled: autoRecordEnabled
    });
  }

  if (message.action === "getMeetingStatus") {
    checkMeetingState();
    sendResponse({ 
      isInMeeting: isInMeeting, 
      recording: recordingStarted 
    });
  }
  
  return true;
});

// Setup observers when page loads
function initializeObservers() {
  setupLeaveButtonObserver();
  
  // Also check on URL changes
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log("🔗 URL changed, checking meeting status...");
      setTimeout(checkMeetingState, 2000);
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
}

// Check for meeting state every 2 seconds as backup
setInterval(checkMeetingState, 2000);

// Initial setup
setTimeout(() => {
  initializeObservers();
  checkMeetingState();
  console.log("🔍 Teams Auto Recorder content script fully loaded");
}, 1000);

console.log("🔍 Teams Auto Recorder content script loaded");