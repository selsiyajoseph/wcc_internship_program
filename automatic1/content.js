















// // // // // // Teams meeting detection and automatic recording control
// // // // // let isInMeeting = false;
// // // // // let recordingStarted = false;
// // // // // let autoRecordEnabled = false;

// // // // // // Check auto record permission on load
// // // // // checkAutoRecordPermission();

// // // // // async function checkAutoRecordPermission() {
// // // // //   return new Promise((resolve) => {
// // // // //     chrome.storage.local.get(['autoRecordPermission'], (result) => {
// // // // //       autoRecordEnabled = result.autoRecordPermission || false;
// // // // //       console.log("🔐 Auto record enabled:", autoRecordEnabled);
// // // // //       resolve(autoRecordEnabled);
// // // // //     });
// // // // //   });
// // // // // }

// // // // // function checkMeetingState() {
// // // // //   const url = window.location.href;
// // // // //   const wasInMeeting = isInMeeting;

// // // // //   // Check if in meeting by URL patterns
// // // // //   isInMeeting = url.includes("teams.live.com/v2/") || 
// // // // //                 (url.includes("teams.microsoft.com") && url.includes("meeting"));

// // // // //   // Check for leave button presence as additional indicator
// // // // //   const leaveButton = document.getElementById("hangup-button") || 
// // // // //                      document.querySelector('[data-tid="hangup-button"]') ||
// // // // //                      document.querySelector('[aria-label*="Leave"]') ||
// // // // //                      document.querySelector('[title*="Leave"]') ||
// // // // //                      document.querySelector('button[aria-label*="hang up"]') ||
// // // // //                      document.querySelector('button[title*="Leave call"]');

// // // // //   if (leaveButton && leaveButton.offsetParent !== null) {
// // // // //     isInMeeting = true;
// // // // //     console.log("✅ Leave button found - In meeting");
// // // // //   }

// // // // //   // Check for meeting indicators
// // // // //   const videoButton = document.querySelector('button[aria-label*="Turn on camera"]') ||
// // // // //                      document.querySelector('button[title*="camera"]');
  
// // // // //   const muteButton = document.querySelector('button[aria-label*="Mute"]') ||
// // // // //                     document.querySelector('button[title*="mute"]');

// // // // //   if ((videoButton || muteButton) && !isInMeeting) {
// // // // //     isInMeeting = true;
// // // // //     console.log("✅ Meeting controls found - In meeting");
// // // // //   }

// // // // //   // State change detection - Only auto record if permission granted
// // // // //   if (isInMeeting && !wasInMeeting && autoRecordEnabled && !recordingStarted) {
// // // // //     console.log("✅ Meeting joined - Auto starting recording");
// // // // //     startAutoRecording();
// // // // //   } else if (!isInMeeting && wasInMeeting && recordingStarted) {
// // // // //     console.log("❌ Meeting left - Auto stopping recording");
// // // // //     stopAutoRecording();
// // // // //   }

// // // // //   // Update meeting status in storage
// // // // //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // // // // }

// // // // // function startAutoRecording() {
// // // // //   if (recordingStarted) return;
  
// // // // //   console.log("🎬 Attempting auto recording start...");
// // // // //   recordingStarted = true;
  
// // // // //   // Send message to background to start recording
// // // // //   chrome.runtime.sendMessage({ 
// // // // //     action: "autoStartRecording"
// // // // //   }, (response) => {
// // // // //     if (response && response.success) {
// // // // //       console.log("✅ Auto recording started successfully");
      
// // // // //       // Show recording started notification
// // // // //       showRecordingNotification("started");
// // // // //     } else {
// // // // //       console.log("❌ Auto recording failed to start");
// // // // //       recordingStarted = false;
// // // // //     }
// // // // //   });
// // // // // }

// // // // // function stopAutoRecording() {
// // // // //   if (!recordingStarted) return;
  
// // // // //   console.log("🛑 Attempting auto recording stop...");
  
// // // // //   // Send message to background to stop recording
// // // // //   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
// // // // //     if (response && response.success) {
// // // // //       console.log("✅ Auto recording stopped successfully");
// // // // //       recordingStarted = false;
      
// // // // //       // Show recording stopped notification
// // // // //       showRecordingNotification("stopped");
// // // // //     } else {
// // // // //       console.log("❌ Auto recording failed to stop");
// // // // //     }
// // // // //   });
// // // // // }

// // // // // function showRecordingNotification(type) {
// // // // //   const notification = document.createElement('div');
// // // // //   notification.style.cssText = `
// // // // //     position: fixed;
// // // // //     top: 20px;
// // // // //     right: 20px;
// // // // //     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
// // // // //     color: white;
// // // // //     padding: 15px 20px;
// // // // //     border-radius: 8px;
// // // // //     z-index: 10000;
// // // // //     font-family: Arial, sans-serif;
// // // // //     font-size: 14px;
// // // // //     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
// // // // //   `;
// // // // //   notification.textContent = type === 'started' 
// // // // //     ? '🔴 Recording Started' 
// // // // //     : '⏹️ Recording Stopped - Downloading...';
  
// // // // //   document.body.appendChild(notification);
  
// // // // //   setTimeout(() => {
// // // // //     if (notification.parentNode) {
// // // // //       notification.parentNode.removeChild(notification);
// // // // //     }
// // // // //   }, 3000);
// // // // // }

// // // // // // Listen for auto recording messages
// // // // // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// // // // //   console.log("📨 Content script received:", message.action);
  
// // // // //   if (message.action === "startAutoRecording" && autoRecordEnabled && !recordingStarted) {
// // // // //     console.log("🎬 Starting auto recording from background");
// // // // //     startAutoRecording();
// // // // //     sendResponse({ success: true });
// // // // //   }
  
// // // // //   if (message.action === "updateAutoRecordPermission") {
// // // // //     autoRecordEnabled = message.enabled;
// // // // //     console.log("🔐 Auto record permission updated:", autoRecordEnabled);
// // // // //     sendResponse({ success: true });
// // // // //   }

// // // // //   if (message.action === "checkMeetingStatus") {
// // // // //     sendResponse({ 
// // // // //       isInMeeting: isInMeeting, 
// // // // //       recording: recordingStarted,
// // // // //       autoRecordEnabled: autoRecordEnabled
// // // // //     });
// // // // //   }

// // // // //   if (message.action === "getMeetingStatus") {
// // // // //     checkMeetingState();
// // // // //     sendResponse({ 
// // // // //       isInMeeting: isInMeeting, 
// // // // //       recording: recordingStarted 
// // // // //     });
// // // // //   }
  
// // // // //   return true;
// // // // // });

// // // // // // Enhanced Mutation Observer to detect meeting state changes
// // // // // const observer = new MutationObserver((mutations) => {
// // // // //   let shouldCheck = false;
  
// // // // //   mutations.forEach((mutation) => {
// // // // //     // Check for added/removed nodes that might indicate meeting state change
// // // // //     if (mutation.type === 'childList') {
// // // // //       mutation.addedNodes.forEach(node => {
// // // // //         if (node.nodeType === 1) { // Element node
// // // // //           if (node.id === 'hangup-button' || 
// // // // //               node.getAttribute('data-tid') === 'hangup-button' ||
// // // // //               node.getAttribute('aria-label')?.includes('Leave') ||
// // // // //               node.getAttribute('title')?.includes('Leave')) {
// // // // //             shouldCheck = true;
// // // // //           }
// // // // //         }
// // // // //       });
// // // // //     }
    
// // // // //     // Check for attribute changes
// // // // //     if (mutation.type === 'attributes') {
// // // // //       if (mutation.attributeName === 'style' || 
// // // // //           mutation.attributeName === 'class' ||
// // // // //           mutation.attributeName === 'aria-hidden') {
// // // // //         shouldCheck = true;
// // // // //       }
// // // // //     }
// // // // //   });
  
// // // // //   if (shouldCheck) {
// // // // //     setTimeout(checkMeetingState, 1000);
// // // // //   }
// // // // // });

// // // // // // Start observing
// // // // // observer.observe(document.body, {
// // // // //   childList: true,
// // // // //   subtree: true,
// // // // //   attributes: true,
// // // // //   attributeFilter: ['style', 'class', 'aria-hidden', 'data-tid']
// // // // // });

// // // // // // Also check on URL changes
// // // // // let lastUrl = location.href;
// // // // // new MutationObserver(() => {
// // // // //   const url = location.href;
// // // // //   if (url !== lastUrl) {
// // // // //     lastUrl = url;
// // // // //     setTimeout(checkMeetingState, 2000);
// // // // //   }
// // // // // }).observe(document, { subtree: true, childList: true });

// // // // // // Check for meeting state every 3 seconds as backup
// // // // // setInterval(checkMeetingState, 3000);

// // // // // // Initial check after page load
// // // // // setTimeout(checkMeetingState, 2000);

// // // // // console.log("🔍 Teams Auto Recorder content script loaded");




















// // // // // Teams meeting detection and automatic recording control
// // // // let isInMeeting = false;
// // // // let recordingStarted = false;
// // // // let autoRecordEnabled = false;
// // // // let leaveButtonObserver = null;

// // // // // Check auto record permission on load
// // // // checkAutoRecordPermission();

// // // // async function checkAutoRecordPermission() {
// // // //   return new Promise((resolve) => {
// // // //     chrome.storage.local.get(['autoRecordPermission'], (result) => {
// // // //       autoRecordEnabled = result.autoRecordPermission || false;
// // // //       console.log("🔐 Auto record enabled:", autoRecordEnabled);
// // // //       resolve(autoRecordEnabled);
// // // //     });
// // // //   });
// // // // }

// // // // function checkMeetingState() {
// // // //   const url = window.location.href;
// // // //   const wasInMeeting = isInMeeting;

// // // //   // Check for leave button presence as primary indicator
// // // //   const leaveButton = findLeaveButton();
  
// // // //   if (leaveButton && isElementVisible(leaveButton)) {
// // // //     if (!isInMeeting) {
// // // //       console.log("✅ Leave button visible - Meeting joined");
// // // //       isInMeeting = true;
      
// // // //       // Start recording only when leave button becomes visible
// // // //       if (autoRecordEnabled && !recordingStarted) {
// // // //         console.log("🎬 Starting recording because leave button is visible");
// // // //         startAutoRecording();
// // // //       }
// // // //     }
// // // //   } else {
// // // //     if (isInMeeting) {
// // // //       console.log("❌ Leave button hidden - Meeting ended");
// // // //       isInMeeting = false;
      
// // // //       // Stop recording when leave button disappears
// // // //       if (recordingStarted) {
// // // //         console.log("🛑 Stopping recording because leave button disappeared");
// // // //         stopAutoRecording();
// // // //       }
// // // //     }
// // // //   }

// // // //   // Update meeting status in storage
// // // //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // // // }

// // // // function findLeaveButton() {
// // // //   // Try multiple selectors for leave button
// // // //   const selectors = [
// // // //     '#hangup-button',
// // // //     '[data-tid="hangup-button"]',
// // // //     '[aria-label*="Leave"]',
// // // //     '[aria-label*="leave"]', 
// // // //     '[title*="Leave"]',
// // // //     '[title*="leave"]',
// // // //     'button[aria-label*="hang up"]',
// // // //     'button[title*="Leave call"]',
// // // //     'button[data-tid*="hangup"]',
// // // //     '.ts-calling-hold-button', // Teams specific
// // // //     '.call-controls [aria-label*="Leave"]'
// // // //   ];

// // // //   for (const selector of selectors) {
// // // //     const element = document.querySelector(selector);
// // // //     if (element) {
// // // //       console.log("🔍 Found leave button with selector:", selector);
// // // //       return element;
// // // //     }
// // // //   }
  
// // // //   return null;
// // // // }

// // // // function isElementVisible(element) {
// // // //   if (!element) return false;
  
// // // //   const style = window.getComputedStyle(element);
// // // //   const rect = element.getBoundingClientRect();
  
// // // //   return style.display !== 'none' && 
// // // //          style.visibility !== 'hidden' && 
// // // //          style.opacity !== '0' &&
// // // //          rect.width > 0 && 
// // // //          rect.height > 0 &&
// // // //          element.offsetParent !== null;
// // // // }

// // // // function startAutoRecording() {
// // // //   if (recordingStarted) return;
  
// // // //   console.log("🎬 Attempting auto recording start...");
// // // //   recordingStarted = true;
  
// // // //   // Send message to background to start recording
// // // //   chrome.runtime.sendMessage({ 
// // // //     action: "autoStartRecording"
// // // //   }, (response) => {
// // // //     if (response && response.success) {
// // // //       console.log("✅ Auto recording started successfully");
// // // //       showRecordingNotification("started");
// // // //     } else {
// // // //       console.log("❌ Auto recording failed to start");
// // // //       recordingStarted = false;
// // // //     }
// // // //   });
// // // // }

// // // // function stopAutoRecording() {
// // // //   if (!recordingStarted) return;
  
// // // //   console.log("🛑 Attempting auto recording stop...");
  
// // // //   // Send message to background to stop recording
// // // //   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
// // // //     if (response && response.success) {
// // // //       console.log("✅ Auto recording stopped successfully");
// // // //       recordingStarted = false;
// // // //       showRecordingNotification("stopped");
// // // //     } else {
// // // //       console.log("❌ Auto recording failed to stop");
// // // //     }
// // // //   });
// // // // }

// // // // function showRecordingNotification(type) {
// // // //   // Remove existing notification
// // // //   const existingNotification = document.getElementById('teams-recorder-notification');
// // // //   if (existingNotification) {
// // // //     existingNotification.remove();
// // // //   }

// // // //   const notification = document.createElement('div');
// // // //   notification.id = 'teams-recorder-notification';
// // // //   notification.style.cssText = `
// // // //     position: fixed;
// // // //     top: 20px;
// // // //     right: 20px;
// // // //     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
// // // //     color: white;
// // // //     padding: 15px 20px;
// // // //     border-radius: 8px;
// // // //     z-index: 10000;
// // // //     font-family: Arial, sans-serif;
// // // //     font-size: 14px;
// // // //     font-weight: bold;
// // // //     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
// // // //     border: 2px solid ${type === 'started' ? '#45a049' : '#d32f2f'};
// // // //   `;
// // // //   notification.textContent = type === 'started' 
// // // //     ? '🔴 Recording Started - Meeting Joined' 
// // // //     : '⏹️ Recording Stopped - Meeting Ended';
  
// // // //   document.body.appendChild(notification);
  
// // // //   setTimeout(() => {
// // // //     if (notification.parentNode) {
// // // //       notification.parentNode.removeChild(notification);
// // // //     }
// // // //   }, 5000);
// // // // }

// // // // // Enhanced Mutation Observer specifically for leave button
// // // // function setupLeaveButtonObserver() {
// // // //   if (leaveButtonObserver) {
// // // //     leaveButtonObserver.disconnect();
// // // //   }

// // // //   leaveButtonObserver = new MutationObserver((mutations) => {
// // // //     let leaveButtonChanged = false;
    
// // // //     mutations.forEach((mutation) => {
// // // //       // Check for added/removed nodes
// // // //       if (mutation.type === 'childList') {
// // // //         mutation.addedNodes.forEach(node => {
// // // //           if (node.nodeType === 1 && (
// // // //             node.id === 'hangup-button' || 
// // // //             node.getAttribute('data-tid') === 'hangup-button' ||
// // // //             node.getAttribute('aria-label')?.toLowerCase().includes('leave') ||
// // // //             node.getAttribute('title')?.toLowerCase().includes('leave')
// // // //           )) {
// // // //             leaveButtonChanged = true;
// // // //           }
// // // //         });
        
// // // //         mutation.removedNodes.forEach(node => {
// // // //           if (node.nodeType === 1 && (
// // // //             node.id === 'hangup-button' || 
// // // //             node.getAttribute('data-tid') === 'hangup-button'
// // // //           )) {
// // // //             leaveButtonChanged = true;
// // // //           }
// // // //         });
// // // //       }
      
// // // //       // Check for attribute changes on leave button
// // // //       if (mutation.type === 'attributes' && mutation.target) {
// // // //         const target = mutation.target;
// // // //         if (target.id === 'hangup-button' || 
// // // //             target.getAttribute('data-tid') === 'hangup-button' ||
// // // //             target.getAttribute('aria-label')?.toLowerCase().includes('leave') ||
// // // //             target.getAttribute('title')?.toLowerCase().includes('leave')) {
          
// // // //           if (mutation.attributeName === 'style' || 
// // // //               mutation.attributeName === 'class' ||
// // // //               mutation.attributeName === 'aria-hidden' ||
// // // //               mutation.attributeName === 'disabled') {
// // // //             leaveButtonChanged = true;
// // // //           }
// // // //         }
// // // //       }
// // // //     });
    
// // // //     if (leaveButtonChanged) {
// // // //       console.log("🔍 Leave button state changed, checking meeting status...");
// // // //       setTimeout(checkMeetingState, 500);
// // // //     }
// // // //   });

// // // //   // Start observing the entire document for leave button changes
// // // //   leaveButtonObserver.observe(document.body, {
// // // //     childList: true,
// // // //     subtree: true,
// // // //     attributes: true,
// // // //     attributeFilter: ['style', 'class', 'aria-hidden', 'disabled', 'data-tid']
// // // //   });
// // // // }

// // // // // Listen for auto recording messages
// // // // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// // // //   console.log("📨 Content script received:", message.action);
  
// // // //   if (message.action === "startAutoRecording" && autoRecordEnabled && !recordingStarted) {
// // // //     console.log("🎬 Starting auto recording from background");
// // // //     startAutoRecording();
// // // //     sendResponse({ success: true });
// // // //   }
  
// // // //   if (message.action === "updateAutoRecordPermission") {
// // // //     autoRecordEnabled = message.enabled;
// // // //     console.log("🔐 Auto record permission updated:", autoRecordEnabled);
    
// // // //     // If permission enabled and in meeting, start recording
// // // //     if (autoRecordEnabled && isInMeeting && !recordingStarted) {
// // // //       setTimeout(startAutoRecording, 1000);
// // // //     }
    
// // // //     sendResponse({ success: true });
// // // //   }

// // // //   if (message.action === "checkMeetingStatus") {
// // // //     sendResponse({ 
// // // //       isInMeeting: isInMeeting, 
// // // //       recording: recordingStarted,
// // // //       autoRecordEnabled: autoRecordEnabled
// // // //     });
// // // //   }

// // // //   if (message.action === "getMeetingStatus") {
// // // //     checkMeetingState();
// // // //     sendResponse({ 
// // // //       isInMeeting: isInMeeting, 
// // // //       recording: recordingStarted 
// // // //     });
// // // //   }
  
// // // //   return true;
// // // // });

// // // // // Setup observers when page loads
// // // // function initializeObservers() {
// // // //   setupLeaveButtonObserver();
  
// // // //   // Also check on URL changes
// // // //   let lastUrl = location.href;
// // // //   const urlObserver = new MutationObserver(() => {
// // // //     const url = location.href;
// // // //     if (url !== lastUrl) {
// // // //       lastUrl = url;
// // // //       console.log("🔗 URL changed, checking meeting status...");
// // // //       setTimeout(checkMeetingState, 2000);
// // // //     }
// // // //   });
  
// // // //   urlObserver.observe(document, { subtree: true, childList: true });
// // // // }

// // // // // Check for meeting state every 2 seconds as backup
// // // // setInterval(checkMeetingState, 2000);

// // // // // Initial setup
// // // // setTimeout(() => {
// // // //   initializeObservers();
// // // //   checkMeetingState();
// // // //   console.log("🔍 Teams Auto Recorder content script fully loaded");
// // // // }, 1000);

// // // // console.log("🔍 Teams Auto Recorder content script loaded");











// // // // Teams meeting detection with toolbar visibility and leave button click detection
// // // let isInMeeting = false;
// // // let recordingStarted = false;
// // // let autoRecordEnabled = false;
// // // let toolbarObserver = null;

// // // // Check auto record permission on load
// // // checkAutoRecordPermission();

// // // async function checkAutoRecordPermission() {
// // //   return new Promise((resolve) => {
// // //     chrome.storage.local.get(['autoRecordPermission'], (result) => {
// // //       autoRecordEnabled = result.autoRecordPermission || false;
// // //       console.log("🔐 Auto record enabled:", autoRecordEnabled);
// // //       resolve(autoRecordEnabled);
// // //     });
// // //   });
// // // }

// // // function findMeetingToolbar() {
// // //   // Try multiple selectors for the meeting toolbar/call controls
// // //   const toolbarSelectors = [
// // //     'div[data-tid="call-footer"]',
// // //     'div[role="toolbar"]',
// // //     '.call-controls',
// // //     '.ts-calling-footer',
// // //     'div[aria-label*="call"]',
// // //     'div[data-tid*="call"]',
// // //     '#hangup-button', // Also check if hangup button exists as part of toolbar
// // //     'div[class*="callFooter"]'
// // //   ];

// // //   for (const selector of toolbarSelectors) {
// // //     const element = document.querySelector(selector);
// // //     if (element && isElementVisible(element)) {
// // //       console.log("🔧 Found meeting toolbar with selector:", selector);
// // //       return element;
// // //     }
// // //   }
  
// // //   return null;
// // // }

// // // function isElementVisible(element) {
// // //   if (!element) return false;
  
// // //   const style = window.getComputedStyle(element);
// // //   const rect = element.getBoundingClientRect();
  
// // //   return style.display !== 'none' && 
// // //          style.visibility !== 'hidden' && 
// // //          style.opacity !== '0' &&
// // //          rect.width > 0 && 
// // //          rect.height > 0 &&
// // //          element.offsetParent !== null;
// // // }

// // // function checkToolbarVisibility() {
// // //   const wasInMeeting = isInMeeting;
// // //   const toolbar = findMeetingToolbar();
  
// // //   if (toolbar && !isInMeeting) {
// // //     // Toolbar visible - Meeting started
// // //     isInMeeting = true;
// // //     console.log("🎯 MEETING STARTED - Toolbar is now visible");
// // //     console.log("📍 Toolbar details:", {
// // //       selector: toolbar.tagName + (toolbar.className ? '.' + toolbar.className.split(' ')[0] : ''),
// // //       visible: isElementVisible(toolbar),
// // //       dimensions: toolbar.getBoundingClientRect()
// // //     });
    
// // //     // Start auto recording if enabled
// // //     if (autoRecordEnabled && !recordingStarted) {
// // //       console.log("🎬 AUTO RECORDING - Starting recording due to meeting start");
// // //       startAutoRecording();
// // //     }
    
// // //     showMeetingNotification("started");
    
// // //   } else if (!toolbar && isInMeeting) {
// // //     // Toolbar hidden - but we don't log meeting end here
// // //     // We'll wait for the actual leave button click
// // //     console.log("⚡ Toolbar disappeared, waiting for leave button click to confirm meeting end");
// // //   }
  
// // //   // Update storage
// // //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // // }

// // // function setupLeaveButtonClickHandler() {
// // //   // Remove existing listeners to prevent duplicates
// // //   document.removeEventListener('click', handleLeaveButtonClick, true);
  
// // //   // Add new listener
// // //   document.addEventListener('click', handleLeaveButtonClick, true);
// // //   console.log("🖱️ Leave button click handler activated");
// // // }

// // // function handleLeaveButtonClick(event) {
// // //   // Check if the clicked element or its parent is the leave button
// // //   let target = event.target;
  
// // //   // Traverse up the DOM to find leave button
// // //   while (target && target !== document.body) {
// // //     if (isLeaveButton(target)) {
// // //       console.log("🛑 LEAVE BUTTON CLICKED - Meeting ended by user");
// // //       meetingEnded();
// // //       break;
// // //     }
// // //     target = target.parentElement;
// // //   }
// // // }

// // // function isLeaveButton(element) {
// // //   if (!element) return false;
  
// // //   // Check by ID
// // //   if (element.id === 'hangup-button') return true;
  
// // //   // Check by attributes
// // //   const ariaLabel = element.getAttribute('aria-label') || '';
// // //   const title = element.getAttribute('title') || '';
// // //   const dataTid = element.getAttribute('data-tid') || '';
  
// // //   return ariaLabel.toLowerCase().includes('leave') ||
// // //          ariaLabel.toLowerCase().includes('hang up') ||
// // //          title.toLowerCase().includes('leave') ||
// // //          title.toLowerCase().includes('hang up') ||
// // //          dataTid.includes('hangup') ||
// // //          element.classList.contains('hangup-button');
// // // }

// // // function meetingEnded() {
// // //   if (!isInMeeting) return;
  
// // //   console.log("🎯 MEETING ENDED - Leave button was clicked");
// // //   isInMeeting = false;
  
// // //   // Stop recording if active
// // //   if (recordingStarted) {
// // //     console.log("⏹️ AUTO STOPPING - Stopping recording due to meeting end");
// // //     stopAutoRecording();
// // //   }
  
// // //   showMeetingNotification("ended");
  
// // //   // Update storage
// // //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // // }

// // // function startAutoRecording() {
// // //   if (recordingStarted) return;
  
// // //   console.log("🎬 Attempting auto recording start...");
// // //   recordingStarted = true;
  
// // //   chrome.runtime.sendMessage({ 
// // //     action: "autoStartRecording"
// // //   }, (response) => {
// // //     if (response && response.success) {
// // //       console.log("✅ Auto recording started successfully");
// // //       showRecordingNotification("started");
// // //     } else {
// // //       console.log("❌ Auto recording failed to start");
// // //       recordingStarted = false;
// // //     }
// // //   });
// // // }

// // // function stopAutoRecording() {
// // //   if (!recordingStarted) return;
  
// // //   console.log("🛑 Attempting auto recording stop...");
  
// // //   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
// // //     if (response && response.success) {
// // //       console.log("✅ Auto recording stopped successfully");
// // //       recordingStarted = false;
// // //       showRecordingNotification("stopped");
// // //     } else {
// // //       console.log("❌ Auto recording failed to stop");
// // //     }
// // //   });
// // // }

// // // function showMeetingNotification(type) {
// // //   // Remove existing notification
// // //   const existingNotification = document.getElementById('meeting-status-notification');
// // //   if (existingNotification) {
// // //     existingNotification.remove();
// // //   }

// // //   const notification = document.createElement('div');
// // //   notification.id = 'meeting-status-notification';
// // //   notification.style.cssText = `
// // //     position: fixed;
// // //     top: 10px;
// // //     left: 50%;
// // //     transform: translateX(-50%);
// // //     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
// // //     color: white;
// // //     padding: 12px 18px;
// // //     border-radius: 8px;
// // //     z-index: 10000;
// // //     font-family: Arial, sans-serif;
// // //     font-size: 14px;
// // //     font-weight: bold;
// // //     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
// // //     border: 2px solid ${type === 'started' ? '#45a049' : '#d32f2f'};
// // //   `;
// // //   notification.textContent = type === 'started' 
// // //     ? '🔴 Meeting Started - Auto Recording' 
// // //     : '⏹️ Meeting Ended - Recording Stopped';
  
// // //   document.body.appendChild(notification);
  
// // //   setTimeout(() => {
// // //     if (notification.parentNode) {
// // //       notification.parentNode.removeChild(notification);
// // //     }
// // //   }, 5000);
// // // }

// // // function showRecordingNotification(type) {
// // //   const notification = document.createElement('div');
// // //   notification.id = 'recording-status-notification';
// // //   notification.style.cssText = `
// // //     position: fixed;
// // //     top: 60px;
// // //     left: 50%;
// // //     transform: translateX(-50%);
// // //     background: ${type === 'started' ? '#2196F3' : '#FF9800'};
// // //     color: white;
// // //     padding: 8px 12px;
// // //     border-radius: 5px;
// // //     z-index: 9999;
// // //     font-family: Arial, sans-serif;
// // //     font-size: 11px;
// // //     box-shadow: 0 2px 8px rgba(0,0,0,0.2);
// // //   `;
// // //   notification.textContent = type === 'started' 
// // //     ? '🔴 Recording Started' 
// // //     : '⏹️ Recording Stopped - Downloading...';
  
// // //   document.body.appendChild(notification);
  
// // //   setTimeout(() => {
// // //     if (notification.parentNode) {
// // //       notification.parentNode.removeChild(notification);
// // //     }
// // //   }, 4000);
// // // }

// // // // Enhanced Mutation Observer for toolbar visibility
// // // function setupToolbarObserver() {
// // //   if (toolbarObserver) {
// // //     toolbarObserver.disconnect();
// // //   }

// // //   toolbarObserver = new MutationObserver((mutations) => {
// // //     let toolbarChanged = false;
    
// // //     mutations.forEach((mutation) => {
// // //       // Check for added/removed nodes that might be toolbar
// // //       if (mutation.type === 'childList') {
// // //         mutation.addedNodes.forEach(node => {
// // //           if (node.nodeType === 1 && (
// // //             node.id === 'hangup-button' || 
// // //             node.getAttribute('data-tid')?.includes('call') ||
// // //             node.getAttribute('role') === 'toolbar'
// // //           )) {
// // //             console.log("➕ Possible toolbar element added");
// // //             toolbarChanged = true;
// // //           }
// // //         });
// // //       }
      
// // //       // Check for attribute changes that affect visibility
// // //       if (mutation.type === 'attributes') {
// // //         if (mutation.attributeName === 'style' || 
// // //             mutation.attributeName === 'class' ||
// // //             mutation.attributeName === 'aria-hidden') {
// // //           toolbarChanged = true;
// // //         }
// // //       }
// // //     });
    
// // //     if (toolbarChanged) {
// // //       console.log("🔍 Toolbar state changed, checking visibility...");
// // //       setTimeout(checkToolbarVisibility, 500);
// // //     }
// // //   });

// // //   // Start observing the entire document
// // //   toolbarObserver.observe(document.body, {
// // //     childList: true,
// // //     subtree: true,
// // //     attributes: true,
// // //     attributeFilter: ['style', 'class', 'aria-hidden', 'data-tid']
// // //   });
// // // }

// // // // Listen for messages
// // // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// // //   console.log("📨 Content script received:", message.action);
  
// // //   if (message.action === "updateAutoRecordPermission") {
// // //     autoRecordEnabled = message.enabled;
// // //     console.log("🔐 Auto record permission updated:", autoRecordEnabled);
// // //     sendResponse({ success: true });
// // //   }

// // //   if (message.action === "checkMeetingStatus") {
// // //     sendResponse({ 
// // //       isInMeeting: isInMeeting, 
// // //       recording: recordingStarted,
// // //       autoRecordEnabled: autoRecordEnabled
// // //     });
// // //   }
  
// // //   return true;
// // // });

// // // // Initialize observers and handlers
// // // function initializeDetection() {
// // //   setupToolbarObserver();
// // //   setupLeaveButtonClickHandler();
  
// // //   // Also monitor URL changes
// // //   let lastUrl = location.href;
// // //   const urlObserver = new MutationObserver(() => {
// // //     const url = location.href;
// // //     if (url !== lastUrl) {
// // //       lastUrl = url;
// // //       console.log("🔗 URL changed, reinitializing detection...");
// // //       setTimeout(() => {
// // //         initializeDetection();
// // //         checkToolbarVisibility();
// // //       }, 2000);
// // //     }
// // //   });
  
// // //   urlObserver.observe(document, { subtree: true, childList: true });
// // // }

// // // // Periodic check as backup
// // // setInterval(checkToolbarVisibility, 3000);

// // // // Initial setup
// // // setTimeout(() => {
// // //   initializeDetection();
// // //   checkToolbarVisibility();
// // //   console.log("🔍 Teams Auto Recorder initialized");
// // //   console.log("📋 Detection mode: Toolbar visibility = Meeting Start, Leave button click = Meeting End");
// // // }, 1500);

// // // console.log("🔍 Teams Auto Recorder content script loaded");



// // // Teams meeting detection with toolbar visibility and leave button click detection
// // let isInMeeting = false;
// // let recordingStarted = false;
// // let autoRecordEnabled = false;
// // let toolbarObserver = null;

// // // Check auto record permission on load
// // checkAutoRecordPermission();

// // async function checkAutoRecordPermission() {
// //   return new Promise((resolve) => {
// //     chrome.storage.local.get(['autoRecordPermission'], (result) => {
// //       autoRecordEnabled = result.autoRecordPermission || false;
// //       console.log("🔐 Auto record enabled:", autoRecordEnabled);
// //       resolve(autoRecordEnabled);
// //     });
// //   });
// // }

// // function findMeetingToolbar() {
// //   // Try multiple selectors for the meeting toolbar/call controls
// //   const toolbarSelectors = [
// //     'div[data-tid="call-footer"]',
// //     'div[role="toolbar"]',
// //     '.call-controls',
// //     '.ts-calling-footer',
// //     'div[aria-label*="call"]',
// //     'div[data-tid*="call"]',
// //     '#hangup-button', // Also check if hangup button exists as part of toolbar
// //     'div[class*="callFooter"]'
// //   ];

// //   for (const selector of toolbarSelectors) {
// //     const element = document.querySelector(selector);
// //     if (element && isElementVisible(element)) {
// //       console.log("🔧 Found meeting toolbar with selector:", selector);
// //       return element;
// //     }
// //   }
  
// //   return null;
// // }

// // function isElementVisible(element) {
// //   if (!element) return false;
  
// //   const style = window.getComputedStyle(element);
// //   const rect = element.getBoundingClientRect();
  
// //   return style.display !== 'none' && 
// //          style.visibility !== 'hidden' && 
// //          style.opacity !== '0' &&
// //          rect.width > 0 && 
// //          rect.height > 0 &&
// //          element.offsetParent !== null;
// // }

// // function checkToolbarVisibility() {
// //   const wasInMeeting = isInMeeting;
// //   const toolbar = findMeetingToolbar();
  
// //   if (toolbar && !isInMeeting) {
// //     // Toolbar visible - Meeting started
// //     isInMeeting = true;
// //     console.log("🎯 MEETING STARTED - Toolbar is now visible");
// //     console.log("📍 Toolbar details:", {
// //       selector: toolbar.tagName + (toolbar.className ? '.' + toolbar.className.split(' ')[0] : ''),
// //       visible: isElementVisible(toolbar),
// //       dimensions: toolbar.getBoundingClientRect()
// //     });
    
// //     // Start auto recording if enabled
// //     if (autoRecordEnabled && !recordingStarted) {
// //       console.log("🎬 AUTO RECORDING - Starting recording due to meeting start");
// //       startAutoRecording();
// //     }
    
// //     showMeetingNotification("started");
    
// //   } else if (!toolbar && isInMeeting) {
// //     // Toolbar hidden - but we don't log meeting end here
// //     // We'll wait for the actual leave button click
// //     console.log("⚡ Toolbar disappeared, waiting for leave button click to confirm meeting end");
// //   }
  
// //   // Update storage
// //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // }

// // function setupLeaveButtonClickHandler() {
// //   // Remove existing listeners to prevent duplicates
// //   document.removeEventListener('click', handleLeaveButtonClick, true);
  
// //   // Add new listener
// //   document.addEventListener('click', handleLeaveButtonClick, true);
// //   console.log("🖱️ Leave button click handler activated");
// // }

// // function handleLeaveButtonClick(event) {
// //   // Check if the clicked element or its parent is the leave button
// //   let target = event.target;
  
// //   // Traverse up the DOM to find leave button
// //   while (target && target !== document.body) {
// //     if (isLeaveButton(target)) {
// //       console.log("🛑 LEAVE BUTTON CLICKED - Meeting ended by user");
// //       meetingEnded();
// //       break;
// //     }
// //     target = target.parentElement;
// //   }
// // }

// // function isLeaveButton(element) {
// //   if (!element) return false;
  
// //   // Check by ID
// //   if (element.id === 'hangup-button') return true;
  
// //   // Check by attributes
// //   const ariaLabel = element.getAttribute('aria-label') || '';
// //   const title = element.getAttribute('title') || '';
// //   const dataTid = element.getAttribute('data-tid') || '';
  
// //   return ariaLabel.toLowerCase().includes('leave') ||
// //          ariaLabel.toLowerCase().includes('hang up') ||
// //          title.toLowerCase().includes('leave') ||
// //          title.toLowerCase().includes('hang up') ||
// //          dataTid.includes('hangup') ||
// //          element.classList.contains('hangup-button');
// // }

// // function meetingEnded() {
// //   if (!isInMeeting) return;
  
// //   console.log("🎯 MEETING ENDED - Leave button was clicked");
// //   isInMeeting = false;
  
// //   // Stop recording if active
// //   if (recordingStarted) {
// //     console.log("⏹️ AUTO STOPPING - Stopping recording due to meeting end");
// //     stopAutoRecording();
// //   }
  
// //   showMeetingNotification("ended");
  
// //   // Update storage
// //   chrome.storage.local.set({ isInMeeting: isInMeeting });
// // }

// // function startAutoRecording() {
// //   if (recordingStarted) return;
  
// //   console.log("🎬 Attempting auto recording start...");
// //   recordingStarted = true;
  
// //   chrome.runtime.sendMessage({ 
// //     action: "autoStartRecording"
// //   }, (response) => {
// //     if (response && response.success) {
// //       console.log("✅ Auto recording started successfully");
// //       showRecordingNotification("started");
// //     } else {
// //       console.log("❌ Auto recording failed to start");
// //       recordingStarted = false;
// //     }
// //   });
// // }

// // function stopAutoRecording() {
// //   if (!recordingStarted) return;
  
// //   console.log("🛑 Attempting auto recording stop...");
  
// //   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
// //     if (response && response.success) {
// //       console.log("✅ Auto recording stopped successfully");
// //       recordingStarted = false;
// //       showRecordingNotification("stopped");
// //     } else {
// //       console.log("❌ Auto recording failed to stop");
// //     }
// //   });
// // }

// // function showMeetingNotification(type) {
// //   // Remove existing notification
// //   const existingNotification = document.getElementById('meeting-status-notification');
// //   if (existingNotification) {
// //     existingNotification.remove();
// //   }

// //   const notification = document.createElement('div');
// //   notification.id = 'meeting-status-notification';
// //   notification.style.cssText = `
// //     position: fixed;
// //     top: 10px;
// //     left: 50%;
// //     transform: translateX(-50%);
// //     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
// //     color: white;
// //     padding: 12px 18px;
// //     border-radius: 8px;
// //     z-index: 10000;
// //     font-family: Arial, sans-serif;
// //     font-size: 14px;
// //     font-weight: bold;
// //     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
// //     border: 2px solid ${type === 'started' ? '#45a049' : '#d32f2f'};
// //   `;
// //   notification.textContent = type === 'started' 
// //     ? '🔴 Meeting Started - Auto Recording' 
// //     : '⏹️ Meeting Ended - Recording Stopped';
  
// //   document.body.appendChild(notification);
  
// //   setTimeout(() => {
// //     if (notification.parentNode) {
// //       notification.parentNode.removeChild(notification);
// //     }
// //   }, 5000);
// // }

// // function showRecordingNotification(type) {
// //   const notification = document.createElement('div');
// //   notification.id = 'recording-status-notification';
// //   notification.style.cssText = `
// //     position: fixed;
// //     top: 60px;
// //     left: 50%;
// //     transform: translateX(-50%);
// //     background: ${type === 'started' ? '#2196F3' : '#FF9800'};
// //     color: white;
// //     padding: 8px 12px;
// //     border-radius: 5px;
// //     z-index: 9999;
// //     font-family: Arial, sans-serif;
// //     font-size: 11px;
// //     box-shadow: 0 2px 8px rgba(0,0,0,0.2);
// //   `;
// //   notification.textContent = type === 'started' 
// //     ? '🔴 Recording Started' 
// //     : '⏹️ Recording Stopped - Downloading...';
  
// //   document.body.appendChild(notification);
  
// //   setTimeout(() => {
// //     if (notification.parentNode) {
// //       notification.parentNode.removeChild(notification);
// //     }
// //   }, 4000);
// // }

// // // Enhanced Mutation Observer for toolbar visibility
// // function setupToolbarObserver() {
// //   if (toolbarObserver) {
// //     toolbarObserver.disconnect();
// //   }

// //   toolbarObserver = new MutationObserver((mutations) => {
// //     let toolbarChanged = false;
    
// //     mutations.forEach((mutation) => {
// //       // Check for added/removed nodes that might be toolbar
// //       if (mutation.type === 'childList') {
// //         mutation.addedNodes.forEach(node => {
// //           if (node.nodeType === 1 && (
// //             node.id === 'hangup-button' || 
// //             node.getAttribute('data-tid')?.includes('call') ||
// //             node.getAttribute('role') === 'toolbar'
// //           )) {
// //             console.log("➕ Possible toolbar element added");
// //             toolbarChanged = true;
// //           }
// //         });
// //       }
      
// //       // Check for attribute changes that affect visibility
// //       if (mutation.type === 'attributes') {
// //         if (mutation.attributeName === 'style' || 
// //             mutation.attributeName === 'class' ||
// //             mutation.attributeName === 'aria-hidden') {
// //           toolbarChanged = true;
// //         }
// //       }
// //     });
    
// //     if (toolbarChanged) {
// //       console.log("🔍 Toolbar state changed, checking visibility...");
// //       setTimeout(checkToolbarVisibility, 500);
// //     }
// //   });

// //   // Start observing the entire document
// //   toolbarObserver.observe(document.body, {
// //     childList: true,
// //     subtree: true,
// //     attributes: true,
// //     attributeFilter: ['style', 'class', 'aria-hidden', 'data-tid']
// //   });
// // }

// // // Listen for messages
// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   console.log("📨 Content script received:", message.action);
  
// //   if (message.action === "updateAutoRecordPermission") {
// //     autoRecordEnabled = message.enabled;
// //     console.log("🔐 Auto record permission updated:", autoRecordEnabled);
// //     sendResponse({ success: true });
// //   }

// //   if (message.action === "checkMeetingStatus") {
// //     sendResponse({ 
// //       isInMeeting: isInMeeting, 
// //       recording: recordingStarted,
// //       autoRecordEnabled: autoRecordEnabled
// //     });
// //   }
  
// //   return true;
// // });

// // // Initialize observers and handlers
// // function initializeDetection() {
// //   setupToolbarObserver();
// //   setupLeaveButtonClickHandler();
  
// //   // Also monitor URL changes
// //   let lastUrl = location.href;
// //   const urlObserver = new MutationObserver(() => {
// //     const url = location.href;
// //     if (url !== lastUrl) {
// //       lastUrl = url;
// //       console.log("🔗 URL changed, reinitializing detection...");
// //       setTimeout(() => {
// //         initializeDetection();
// //         checkToolbarVisibility();
// //       }, 2000);
// //     }
// //   });
  
// //   urlObserver.observe(document, { subtree: true, childList: true });
// // }

// // // Periodic check as backup
// // setInterval(checkToolbarVisibility, 3000);

// // // Initial setup
// // setTimeout(() => {
// //   initializeDetection();
// //   checkToolbarVisibility();
// //   console.log("🔍 Teams Auto Recorder initialized");
// //   console.log("📋 Detection mode: Toolbar visibility = Meeting Start, Leave button click = Meeting End");
// // }, 1500);

// // console.log("🔍 Teams Auto Recorder content script loaded");

// // Teams meeting detection with Join button click detection
// let isInMeeting = false;
// let recordingStarted = false;
// let autoRecordEnabled = false;
// let joinButtonObserver = null;

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

// function findJoinButton() {
//   // Look for the prejoin join button
//   const joinButton = document.getElementById('prejoin-join-button');
//   if (joinButton) {
//     console.log("🔍 Found Join button:", {
//       id: joinButton.id,
//       text: joinButton.textContent,
//       visible: isElementVisible(joinButton)
//     });
//     return joinButton;
//   }
  
//   // Also check for other join button selectors as fallback
//   const fallbackSelectors = [
//     'button[data-tid="prejoin-join-button"]',
//     'button[aria-label*="Join"]',
//     'button[aria-label*="join"]',
//     '.join-button',
//     'button:contains("Join now")'
//   ];
  
//   for (const selector of fallbackSelectors) {
//     const button = document.querySelector(selector);
//     if (button && isElementVisible(button)) {
//       console.log("🔍 Found Join button with selector:", selector);
//       return button;
//     }
//   }
  
//   return null;
// }

// function isElementVisible(element) {
//   if (!element) return false;
  
//   const style = window.getComputedStyle(element);
//   const rect = element.getBoundingClientRect();
  
//   return style.display !== 'none' && 
//          style.visibility !== 'hidden' && 
//          style.opacity !== '0' &&
//          rect.width > 0 && 
//          rect.height > 0 &&
//          element.offsetParent !== null;
// }

// function setupJoinButtonClickHandler() {
//   // Remove existing listeners to prevent duplicates
//   document.removeEventListener('click', handleJoinButtonClick, true);
  
//   // Add new listener
//   document.addEventListener('click', handleJoinButtonClick, true);
//   console.log("🖱️ Join button click handler activated");
// }

// function handleJoinButtonClick(event) {
//   // Check if the clicked element or its parent is the join button
//   let target = event.target;
  
//   // Traverse up the DOM to find join button
//   while (target && target !== document.body) {
//     if (isJoinButton(target)) {
//       console.log("🎯 JOIN BUTTON CLICKED - User is joining meeting");
//       meetingStarted();
//       break;
//     }
//     target = target.parentElement;
//   }
// }

// function isJoinButton(element) {
//   if (!element) return false;
  
//   // Check by ID (primary method)
//   if (element.id === 'prejoin-join-button') return true;
  
//   // Check by data-tid attribute
//   if (element.getAttribute('data-tid') === 'prejoin-join-button') return true;
  
//   // Check by attributes and text content
//   const ariaLabel = element.getAttribute('aria-label') || '';
//   const textContent = element.textContent || '';
  
//   return (ariaLabel.toLowerCase().includes('join') && 
//           !ariaLabel.toLowerCase().includes('leave')) ||
//          textContent.toLowerCase().includes('join now') ||
//          textContent.trim() === 'Join now';
// }

// function setupLeaveButtonClickHandler() {
//   // Remove existing listeners to prevent duplicates
//   document.removeEventListener('click', handleLeaveButtonClick, true);
  
//   // Add new listener
//   document.addEventListener('click', handleLeaveButtonClick, true);
//   console.log("🖱️ Leave button click handler activated");
// }

// function handleLeaveButtonClick(event) {
//   // Check if the clicked element or its parent is the leave button
//   let target = event.target;
  
//   // Traverse up the DOM to find leave button
//   while (target && target !== document.body) {
//     if (isLeaveButton(target)) {
//       console.log("🛑 LEAVE BUTTON CLICKED - Meeting ended by user");
//       meetingEnded();
//       break;
//     }
//     target = target.parentElement;
//   }
// }

// function isLeaveButton(element) {
//   if (!element) return false;
  
//   // Check by ID
//   if (element.id === 'hangup-button') return true;
  
//   // Check by attributes
//   const ariaLabel = element.getAttribute('aria-label') || '';
//   const title = element.getAttribute('title') || '';
//   const dataTid = element.getAttribute('data-tid') || '';
  
//   return ariaLabel.toLowerCase().includes('leave') ||
//          ariaLabel.toLowerCase().includes('hang up') ||
//          title.toLowerCase().includes('leave') ||
//          title.toLowerCase().includes('hang up') ||
//          dataTid.includes('hangup') ||
//          element.classList.contains('hangup-button');
// }

// function meetingStarted() {
//   if (isInMeeting) return;
  
//   console.log("🎯 MEETING STARTED - Join button was clicked");
//   isInMeeting = true;
  
//   // Start auto recording if enabled
//   if (autoRecordEnabled && !recordingStarted) {
//     console.log("🎬 AUTO RECORDING - Starting recording due to meeting start");
//     startAutoRecording();
//   }
  
//   showMeetingNotification("started");
  
//   // Update storage
//   chrome.storage.local.set({ isInMeeting: isInMeeting });
// }

// function meetingEnded() {
//   if (!isInMeeting) return;
  
//   console.log("🎯 MEETING ENDED - Leave button was clicked");
//   isInMeeting = false;
  
//   // Stop recording if active
//   if (recordingStarted) {
//     console.log("⏹️ AUTO STOPPING - Stopping recording due to meeting end");
//     stopAutoRecording();
//   }
  
//   showMeetingNotification("ended");
  
//   // Update storage
//   chrome.storage.local.set({ isInMeeting: isInMeeting });
// }

// function startAutoRecording() {
//   if (recordingStarted) return;
  
//   console.log("🎬 Attempting auto recording start...");
//   recordingStarted = true;
  
//   chrome.runtime.sendMessage({ 
//     action: "autoStartRecording"
//   }, (response) => {
//     if (response && response.success) {
//       console.log("✅ Auto recording started successfully");
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
  
//   chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
//     if (response && response.success) {
//       console.log("✅ Auto recording stopped successfully");
//       recordingStarted = false;
//       showRecordingNotification("stopped");
//     } else {
//       console.log("❌ Auto recording failed to stop");
//     }
//   });
// }

// function showMeetingNotification(type) {
//   // Remove existing notification
//   const existingNotification = document.getElementById('meeting-status-notification');
//   if (existingNotification) {
//     existingNotification.remove();
//   }

//   const notification = document.createElement('div');
//   notification.id = 'meeting-status-notification';
//   notification.style.cssText = `
//     position: fixed;
//     top: 10px;
//     left: 50%;
//     transform: translateX(-50%);
//     background: ${type === 'started' ? '#4CAF50' : '#f44336'};
//     color: white;
//     padding: 12px 18px;
//     border-radius: 8px;
//     z-index: 10000;
//     font-family: Arial, sans-serif;
//     font-size: 14px;
//     font-weight: bold;
//     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//     border: 2px solid ${type === 'started' ? '#45a049' : '#d32f2f'};
//   `;
//   notification.textContent = type === 'started' 
//     ? '🔴 Meeting Started - Auto Recording' 
//     : '⏹️ Meeting Ended - Recording Stopped';
  
//   document.body.appendChild(notification);
  
//   setTimeout(() => {
//     if (notification.parentNode) {
//       notification.parentNode.removeChild(notification);
//     }
//   }, 5000);
// }

// function showRecordingNotification(type) {
//   const notification = document.createElement('div');
//   notification.id = 'recording-status-notification';
//   notification.style.cssText = `
//     position: fixed;
//     top: 60px;
//     left: 50%;
//     transform: translateX(-50%);
//     background: ${type === 'started' ? '#2196F3' : '#FF9800'};
//     color: white;
//     padding: 8px 12px;
//     border-radius: 5px;
//     z-index: 9999;
//     font-family: Arial, sans-serif;
//     font-size: 11px;
//     box-shadow: 0 2px 8px rgba(0,0,0,0.2);
//   `;
//   notification.textContent = type === 'started' 
//     ? '🔴 Recording Started' 
//     : '⏹️ Recording Stopped - Downloading...';
  
//   document.body.appendChild(notification);
  
//   setTimeout(() => {
//     if (notification.parentNode) {
//       notification.parentNode.removeChild(notification);
//     }
//   }, 4000);
// }

// // Enhanced Mutation Observer for join button appearance
// function setupJoinButtonObserver() {
//   if (joinButtonObserver) {
//     joinButtonObserver.disconnect();
//   }

//   joinButtonObserver = new MutationObserver((mutations) => {
//     let joinButtonAppeared = false;
    
//     mutations.forEach((mutation) => {
//       // Check for added nodes that might be join button
//       if (mutation.type === 'childList') {
//         mutation.addedNodes.forEach(node => {
//           if (node.nodeType === 1 && (
//             node.id === 'prejoin-join-button' || 
//             node.getAttribute('data-tid') === 'prejoin-join-button'
//           )) {
//             console.log("➕ Join button added to DOM");
//             joinButtonAppeared = true;
//           }
//         });
//       }
      
//       // Check for attribute changes on join button
//       if (mutation.type === 'attributes' && 
//           (mutation.target.id === 'prejoin-join-button' || 
//            mutation.target.getAttribute('data-tid') === 'prejoin-join-button')) {
//         console.log("⚡ Join button attribute changed:", mutation.attributeName);
//         joinButtonAppeared = true;
//       }
//     });
    
//     if (joinButtonAppeared) {
//       console.log("🔍 Join button state changed, setting up click handler...");
//       setTimeout(() => {
//         setupJoinButtonClickHandler();
//         setupLeaveButtonClickHandler();
//       }, 500);
//     }
//   });

//   // Start observing for join button specifically
//   joinButtonObserver.observe(document.body, {
//     childList: true,
//     subtree: true,
//     attributes: true,
//     attributeFilter: ['style', 'class', 'aria-hidden', 'disabled', 'id', 'data-tid']
//   });
// }

// // Listen for messages
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Content script received:", message.action);
  
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
  
//   return true;
// });

// // Initialize observers and handlers
// function initializeDetection() {
//   setupJoinButtonObserver();
//   setupJoinButtonClickHandler();
//   setupLeaveButtonClickHandler();
  
//   // Check if join button already exists
//   const existingJoinButton = findJoinButton();
//   if (existingJoinButton) {
//     console.log("✅ Join button already present on page");
//   }
  
//   // Also monitor URL changes
//   let lastUrl = location.href;
//   const urlObserver = new MutationObserver(() => {
//     const url = location.href;
//     if (url !== lastUrl) {
//       lastUrl = url;
//       console.log("🔗 URL changed, reinitializing detection...");
//       setTimeout(() => {
//         initializeDetection();
//       }, 2000);
//     }
//   });
  
//   urlObserver.observe(document, { subtree: true, childList: true });
// }

// // Initial setup
// setTimeout(() => {
//   initializeDetection();
//   console.log("🔍 Teams Auto Recorder initialized");
//   console.log("📋 Detection mode: Join button click = Meeting Start, Leave button click = Meeting End");
// }, 1500);

// console.log("🔍 Teams Auto Recorder content script loaded");

// Teams meeting detection with Join button click detection and delay
let isInMeeting = false;
let recordingStarted = false;
let autoRecordEnabled = false;
let joinButtonObserver = null;

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

function findJoinButton() {
  // Look for the prejoin join button
  const joinButton = document.getElementById('prejoin-join-button');
  if (joinButton) {
    console.log("🔍 Found Join button:", {
      id: joinButton.id,
      text: joinButton.textContent,
      visible: isElementVisible(joinButton)
    });
    return joinButton;
  }
  
  // Also check for other join button selectors as fallback
  const fallbackSelectors = [
    'button[data-tid="prejoin-join-button"]',
    'button[aria-label*="Join"]',
    'button[aria-label*="join"]',
    '.join-button'
  ];
  
  for (const selector of fallbackSelectors) {
    const button = document.querySelector(selector);
    if (button && isElementVisible(button)) {
      console.log("🔍 Found Join button with selector:", selector);
      return button;
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

function setupJoinButtonClickHandler() {
  // Remove existing listeners to prevent duplicates
  document.removeEventListener('click', handleJoinButtonClick, true);
  
  // Add new listener
  document.addEventListener('click', handleJoinButtonClick, true);
  console.log("🖱️ Join button click handler activated");
}

function handleJoinButtonClick(event) {
  // Check if the clicked element or its parent is the join button
  let target = event.target;
  
  // Traverse up the DOM to find join button
  while (target && target !== document.body) {
    if (isJoinButton(target)) {
      console.log("🎯 JOIN BUTTON CLICKED - User is joining meeting");
      console.log("⏰ Starting 3-second delay before recording...");
      
      // Show immediate notification
      showMeetingNotification("joining");
      
      // Start meeting after 3 seconds to allow meeting to load
      setTimeout(() => {
        meetingStarted();
      }, 3000); // 3 seconds delay
      
      break;
    }
    target = target.parentElement;
  }
}

function isJoinButton(element) {
  if (!element) return false;
  
  // Check by ID (primary method)
  if (element.id === 'prejoin-join-button') return true;
  
  // Check by data-tid attribute
  if (element.getAttribute('data-tid') === 'prejoin-join-button') return true;
  
  // Check by attributes and text content
  const ariaLabel = element.getAttribute('aria-label') || '';
  const textContent = element.textContent || '';
  
  return (ariaLabel.toLowerCase().includes('join') && 
          !ariaLabel.toLowerCase().includes('leave')) ||
         textContent.toLowerCase().includes('join now') ||
         textContent.trim() === 'Join now';
}

function setupLeaveButtonClickHandler() {
  // Remove existing listeners to prevent duplicates
  document.removeEventListener('click', handleLeaveButtonClick, true);
  
  // Add new listener
  document.addEventListener('click', handleLeaveButtonClick, true);
  console.log("🖱️ Leave button click handler activated");
}

function handleLeaveButtonClick(event) {
  // Check if the clicked element or its parent is the leave button
  let target = event.target;
  
  // Traverse up the DOM to find leave button
  while (target && target !== document.body) {
    if (isLeaveButton(target)) {
      console.log("🛑 LEAVE BUTTON CLICKED - Meeting ended by user");
      meetingEnded();
      break;
    }
    target = target.parentElement;
  }
}

function isLeaveButton(element) {
  if (!element) return false;
  
  // Check by ID
  if (element.id === 'hangup-button') return true;
  
  // Check by attributes
  const ariaLabel = element.getAttribute('aria-label') || '';
  const title = element.getAttribute('title') || '';
  const dataTid = element.getAttribute('data-tid') || '';
  
  return ariaLabel.toLowerCase().includes('leave') ||
         ariaLabel.toLowerCase().includes('hang up') ||
         title.toLowerCase().includes('leave') ||
         title.toLowerCase().includes('hang up') ||
         dataTid.includes('hangup') ||
         element.classList.contains('hangup-button');
}

function meetingStarted() {
  if (isInMeeting) return;
  
  console.log("🎯 MEETING STARTED - 3-second delay completed");
  isInMeeting = true;
  
  // Start auto recording if enabled
  if (autoRecordEnabled && !recordingStarted) {
    console.log("🎬 AUTO RECORDING - Starting recording after delay");
    startAutoRecording();
  } else {
    console.log("ℹ️ Auto recording not enabled or already recording");
  }
  
  showMeetingNotification("started");
  
  // Update storage
  chrome.storage.local.set({ isInMeeting: isInMeeting });
}

function meetingEnded() {
  if (!isInMeeting) return;
  
  console.log("🎯 MEETING ENDED - Leave button was clicked");
  isInMeeting = false;
  
  // Stop recording if active
  if (recordingStarted) {
    console.log("⏹️ AUTO STOPPING - Stopping recording due to meeting end");
    stopAutoRecording();
  }
  
  showMeetingNotification("ended");
  
  // Update storage
  chrome.storage.local.set({ isInMeeting: isInMeeting });
}

function startAutoRecording() {
  if (recordingStarted) return;
  
  console.log("🎬 Attempting auto recording start...");
  recordingStarted = true;
  
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

function showMeetingNotification(type) {
  // Remove existing notification
  const existingNotification = document.getElementById('meeting-status-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'meeting-status-notification';
  
  if (type === "joining") {
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #FF9800;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #F57C00;
    `;
    notification.textContent = '🟡 Joining Meeting - Recording starts in 3 seconds...';
  } else if (type === "started") {
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #45a049;
    `;
    notification.textContent = '🔴 Meeting Started - Auto Recording';
  } else {
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #f44336;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #d32f2f;
    `;
    notification.textContent = '⏹️ Meeting Ended - Recording Stopped';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, type === "joining" ? 3000 : 5000);
}

function showRecordingNotification(type) {
  const notification = document.createElement('div');
  notification.id = 'recording-status-notification';
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'started' ? '#2196F3' : '#FF9800'};
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    z-index: 9999;
    font-family: Arial, sans-serif;
    font-size: 11px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  notification.textContent = type === 'started' 
    ? '🔴 Recording Started' 
    : '⏹️ Recording Stopped - Downloading...';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 4000);
}

// Enhanced Mutation Observer for join button appearance
function setupJoinButtonObserver() {
  if (joinButtonObserver) {
    joinButtonObserver.disconnect();
  }

  joinButtonObserver = new MutationObserver((mutations) => {
    let joinButtonAppeared = false;
    
    mutations.forEach((mutation) => {
      // Check for added nodes that might be join button
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.id === 'prejoin-join-button' || 
            node.getAttribute('data-tid') === 'prejoin-join-button'
          )) {
            console.log("➕ Join button added to DOM");
            joinButtonAppeared = true;
          }
        });
      }
      
      // Check for attribute changes on join button
      if (mutation.type === 'attributes' && 
          (mutation.target.id === 'prejoin-join-button' || 
           mutation.target.getAttribute('data-tid') === 'prejoin-join-button')) {
        console.log("⚡ Join button attribute changed:", mutation.attributeName);
        joinButtonAppeared = true;
      }
    });
    
    if (joinButtonAppeared) {
      console.log("🔍 Join button state changed, setting up click handler...");
      setTimeout(() => {
        setupJoinButtonClickHandler();
        setupLeaveButtonClickHandler();
      }, 500);
    }
  });

  // Start observing for join button specifically
  joinButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'aria-hidden', 'disabled', 'id', 'data-tid']
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Content script received:", message.action);
  
  if (message.action === "updateAutoRecordPermission") {
    autoRecordEnabled = message.enabled;
    console.log("🔐 Auto record permission updated:", autoRecordEnabled);
    sendResponse({ success: true });
  }

  if (message.action === "checkMeetingStatus") {
    sendResponse({ 
      isInMeeting: isInMeeting, 
      recording: recordingStarted,
      autoRecordEnabled: autoRecordEnabled
    });
  }
  
  return true;
});

// Initialize observers and handlers
function initializeDetection() {
  setupJoinButtonObserver();
  setupJoinButtonClickHandler();
  setupLeaveButtonClickHandler();
  
  // Check if join button already exists
  const existingJoinButton = findJoinButton();
  if (existingJoinButton) {
    console.log("✅ Join button already present on page");
  }
  
  // Also monitor URL changes
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log("🔗 URL changed, reinitializing detection...");
      setTimeout(() => {
        initializeDetection();
      }, 2000);
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
}

// Initial setup
setTimeout(() => {
  initializeDetection();
  console.log("🔍 Teams Auto Recorder initialized");
  console.log("📋 Detection mode: Join button click (+3s delay) = Meeting Start, Leave button click = Meeting End");
}, 1500);

console.log("🔍 Teams Auto Recorder content script loaded");