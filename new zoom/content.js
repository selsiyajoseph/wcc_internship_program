let isInMeeting = false;
let recordingStarted = false;
let autoRecordEnabled = false;
let meetingStartTimeout = null;
let ignoreAutoStopUntil = 0;
let meetingEndedByUser = false; // ADD THIS - around line 9
// MUTE DETECTION VARIABLES
let micActivityCheckInterval = null;
let micMonitoringActive = false;

// ============================================
// SMART GUARD: Only run on meeting-relevant pages
// ============================================
const currentURL = window.location.href;

const isEmbedPage = currentURL.includes('/wb/embed/');
const isEmptyFrame = currentURL.includes('/pwa-empty-page');
const isDocsFrame = currentURL.includes('/docs') && !currentURL.includes('/start');
const isDriveFrame = currentURL.includes('/drive') && !currentURL.includes('/start');
const isHomePage = currentURL.includes('/wc/home');

// Handle recording on meeting pages and meeting iframes, NOT home page
const isMeetingURL = (currentURL.match(/\/wc\/\d+\/start/) || 
                      currentURL.match(/\/wc\/\d+\/join/) ||
                      currentURL.includes('/webmeeting'));

const shouldHandleRecording = isMeetingURL && 
                               !isEmbedPage && 
                               !isEmptyFrame && 
                               !isDocsFrame && 
                               !isDriveFrame;

console.log("✅ CONTENT.JS LOADED");
console.log("📍 URL:", currentURL);
console.log("📍 Should handle recording:", shouldHandleRecording);

function isMeetingPage() {
  const url = location.href;
  if (url.includes('/wb/embed/')) return false;
  if (url.includes('/wc/home')) return false; // Don't detect home as meeting
  
  return url.includes("/wc/") && (
    url.includes("/join") ||
    url.includes("/start") ||
    url.match(/\/wc\/\d+/)
  );
}

// Only initialize if we should handle recording
if (shouldHandleRecording) {
  console.log("🔐 Checking auto-record permission...");
  checkAutoRecordPermission();
} else {
  console.log("⏭️ Skipping - not a meeting page (embed/dashboard/empty frame)");
}

function isMeetingPage() {
  const url = location.href;
  return url.includes("/wc/") && (
    url.includes("/join") ||
    url.includes("/start") ||
    url.match(/\/wc\/\d+/)
  );
}

// Only check auto record permission if we're handling recording
if (shouldHandleRecording) {
  console.log("🔐 Checking auto-record permission...");
  checkAutoRecordPermission();
}

async function checkAutoRecordPermission() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['autoRecordPermission'], (result) => {
      autoRecordEnabled = result.autoRecordPermission || false;
      console.log("🔐 Auto record enabled:", autoRecordEnabled);
      resolve(autoRecordEnabled);
    });
  });
}

function setupEndButtonDetection() {
  if (!shouldHandleRecording) return;
  
  console.log("🖱️ SHADOW DOM LEAVE BUTTON DETECTION - ACTIVATED!");
  
  function findInShadow(element, searchText) {
    try {
      if (element.textContent && element.textContent.toLowerCase().includes(searchText.toLowerCase())) {
        return element;
      }
      if (element.children) {
        for (let child of element.children) {
          const result = findInShadow(child, searchText);
          if (result) return result;
        }
      }
      if (element.shadowRoot) {
        for (let child of element.shadowRoot.children) {
          const result = findInShadow(child, searchText);
          if (result) return result;
        }
      }
    } catch (e) {}
    return null;
  }
  
  function attachLeaveButtonListener() {
    const leaveBtn = document.querySelector('#wc-footer > div.footer__inner.leave-option-container > div:nth-child(1) > div > div > button:nth-child(2)');
    const endForAllBtn = document.querySelector('#wc-footer > div.footer__inner.leave-option-container > div:nth-child(1) > div > div > button.zmu-btn.leave-meeting-options__btn.leave-meeting-options__btn--default.leave-meeting-options__btn--danger.zmu-btn--default.zmu-btn__outline--white');
    
    let leaveBtn2 = leaveBtn;
    let endForAllBtn2 = endForAllBtn;
    
    if (!leaveBtn || !endForAllBtn) {
      const container = document.querySelector('.leave-option-container');
      if (container) {
        const btns = container.querySelectorAll('button');
        btns.forEach((btn) => {
          const text = btn.textContent.toLowerCase().trim();
          const classes = btn.className;
          if (!leaveBtn2 && (text === 'leave meeting' || text.includes('leave'))) {
            leaveBtn2 = btn;
          }
          if (!endForAllBtn2 && (text === 'end meeting for all' || classes.includes('leave-meeting-options__btn--danger'))) {
            endForAllBtn2 = btn;
          }
        });
      }
    }
    
    if (leaveBtn2 && !leaveBtn2.hasAttribute('data-leave-listener')) {
      leaveBtn2.setAttribute('data-leave-listener', 'true');
      leaveBtn2.addEventListener('click', () => {
        console.log("🎯🎯🎯 LEAVE MEETING CLICKED - STOPPING NOW 🎯🎯🎯");
        stopRecording();
      });
      console.log("✅ LISTENER ATTACHED TO LEAVE MEETING BUTTON");
    }
    
    if (endForAllBtn2 && !endForAllBtn2.hasAttribute('data-end-listener')) {
      endForAllBtn2.setAttribute('data-end-listener', 'true');
      endForAllBtn2.addEventListener('click', () => {
        console.log("🎯🎯🎯 END MEETING FOR ALL CLICKED - STOPPING NOW 🎯🎯🎯");
        stopRecording();
      });
      console.log("✅ LISTENER ATTACHED TO END MEETING FOR ALL BUTTON");
    }
  }
  
  attachLeaveButtonListener();
  setInterval(() => {
    attachLeaveButtonListener();
  }, 2000);
  
  console.log("✅ Shadow DOM Leave button detection active");
}

function setupURLChangeDetection() {
  if (!shouldHandleRecording) return;
  
  console.log("🌐 Setting up URL change detection...");
  let lastURL = window.location.href;
  
  const urlCheckInterval = setInterval(() => {
    const currentURL = window.location.href;
    if (currentURL !== lastURL) {
      const wasMeetingURL = lastURL.includes('/wc/') && (
        lastURL.includes('/start') || 
        lastURL.includes('/join') ||
        lastURL.match(/\/wc\/\d+/)
      );
      const isMeetingURL = currentURL.includes('/wc/') && (
        currentURL.includes('/start') || 
        currentURL.includes('/join') ||
        currentURL.match(/\/wc\/\d+/)
      );
      
      if (wasMeetingURL && !isMeetingURL && isInMeeting) {
        if (Date.now() < ignoreAutoStopUntil) {
          console.log("⏱️ URL CHANGE AUTO-STOP BLOCKED");
          return;
        }
        console.log("🛑 *** URL CHANGED FROM MEETING TO HOME - USER LEFT MEETING! ***");
        stopRecording();
      }
      lastURL = currentURL;
    }
  }, 500);
  
  console.log("✅ URL change detection active");
}

window.addEventListener('beforeunload', () => {
  if (isInMeeting && recordingStarted && shouldHandleRecording) {
    console.log("🚨 PAGE UNLOADING - FORCE STOPPING");
    chrome.runtime.sendMessage({ action: "autoStopRecording" }).catch(e => {
      console.log("⚠️ Could not send stop message:", e);
    });
  }
});

function startMeetingWithDelay() {
  if (!shouldHandleRecording) return;
  if (isInMeeting) return;
  
  if (meetingStartTimeout) {
    clearTimeout(meetingStartTimeout);
  }
  
  console.log("⏰ Starting 3-second delay before recording...");
  meetingStartTimeout = setTimeout(() => {
    console.log("⏰ 3-second delay completed - starting meeting");
    meetingStarted();
  }, 3000);
}

async function meetingStarted() {
  if (!shouldHandleRecording) return;
  
  // Don't start if user just ended meeting
  if (meetingEndedByUser) {
    console.log("⏭️ Skipping - meeting was just ended by user");
    return;
  }
  
  if (isInMeeting && recordingStarted) return;

  console.log("🎯 MEETING STARTED");
  isInMeeting = true;

  setupEndButtonDetection();
  startMicrophoneMonitoring();

  await checkAutoRecordPermission();

  if (autoRecordEnabled && !recordingStarted) {
    console.log("🎬 AUTO RECORDING STARTING");
    startAutoRecording();
  }

  showMeetingNotification("started");
  chrome.storage.local.set({ isInMeeting: isInMeeting });
}

function stopRecording() {
  if (!shouldHandleRecording) return;
  
  console.log("🛑🛑🛑 STOP RECORDING CALLED 🛑🛑🛑");
  
  chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
    console.log("✅ STOP MESSAGE SENT");
  });
  
  if (meetingStartTimeout) {
    clearTimeout(meetingStartTimeout);
    meetingStartTimeout = null;
  }
  
  recordingStarted = false;
  isInMeeting = false;
  stopMicrophoneMonitoring();
  
  console.log("✅ STOP RECORDING SEQUENCE COMPLETE");
}

function meetingEnded() {
  if (!shouldHandleRecording) return;
  if (!isInMeeting) return;
  
  // SET FLAG - Meeting ended by user action
  meetingEndedByUser = true;
  
  if (Date.now() < ignoreAutoStopUntil) {
    console.log("⏱️ Auto-stop BLOCKED");
    return;
  }
  
  console.log("🎯 MEETING ENDED");
  isInMeeting = false;
  stopMicrophoneMonitoring();
  
  if (recordingStarted) {
    console.log("⏹️ RECORDING ACTIVE - STOPPING");
    stopAutoRecording();
  }
  
  recordingStarted = false;
  showMeetingNotification("ended");
  chrome.storage.local.set({ isInMeeting: isInMeeting });
  
  // Reset flag after 5 seconds
  setTimeout(() => {
    meetingEndedByUser = false;
  }, 5000);
}

function startAutoRecording() {
  if (!shouldHandleRecording) return;
  if (recordingStarted) return;
  
  console.log("🎬 Starting auto recording...");
  recordingStarted = true;
  
  showRecordingPopup();
  
  chrome.runtime.sendMessage({ 
    action: "autoStartRecording"
  }, (response) => {
    if (response && response.success) {
      console.log("✅ Recording started successfully");
      showRecordingNotification("started");
    } else {
      console.log("❌ Recording failed to start");
      recordingStarted = false;
      hideRecordingPopup();
    }
  });
}

function stopRecording() {
  if (!shouldHandleRecording) return;
  
  // SET FLAG
  meetingEndedByUser = true;
  
  console.log("🛑🛑🛑 STOP RECORDING CALLED 🛑🛑🛑");
  
  chrome.runtime.sendMessage({ action: "autoStopRecording" }, (response) => {
    console.log("✅ STOP MESSAGE SENT");
  });
  
  if (meetingStartTimeout) {
    clearTimeout(meetingStartTimeout);
    meetingStartTimeout = null;
  }
  
  recordingStarted = false;
  isInMeeting = false;
  stopMicrophoneMonitoring();
  
  // Reset flag after 5 seconds
  setTimeout(() => {
    meetingEndedByUser = false;
  }, 5000);
  
  console.log("✅ STOP RECORDING SEQUENCE COMPLETE");
}

function resetRecordingState() {
  recordingStarted = false;
  isInMeeting = false;
  if (meetingStartTimeout) {
    clearTimeout(meetingStartTimeout);
    meetingStartTimeout = null;
  }
  hideRecordingPopup();
  console.log("🔄 Recording state reset");
}

function showMeetingNotification(type) {
  const existingNotification = document.getElementById('meeting-status-notification');
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement('div');
  notification.id = 'meeting-status-notification';
  const currentTime = new Date().toLocaleTimeString();
  
  if (type === "started") {
    notification.style.cssText = `
      position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
      background: #4CAF50; color: white; padding: 12px 18px; border-radius: 8px;
      z-index: 10000; font-family: Arial; font-size: 14px; font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #45a049;
    `;
    notification.textContent = `🔴 Meeting Started - ${currentTime}`;
  } else {
    notification.style.cssText = `
      position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
      background: #f44336; color: white; padding: 12px 18px; border-radius: 8px;
      z-index: 10000; font-family: Arial; font-size: 14px; font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #d32f2f;
    `;
    notification.textContent = `⏹️ Meeting Ended - ${currentTime}`;
  }
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

function showRecordingNotification(type) {
  const notification = document.createElement('div');
  notification.id = 'recording-status-notification';
  notification.style.cssText = `
    position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
    background: ${type === 'started' ? '#2196F3' : '#FF9800'}; color: white;
    padding: 8px 12px; border-radius: 5px; z-index: 9999; font-family: Arial;
    font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  notification.textContent = type === 'started' 
    ? '🔴 Recording Started' 
    : '⏹️ Recording Stopped - Downloading...';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

function showRecordingPopup() {
  const existingPopup = document.getElementById('recording-live-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'recording-live-popup';
  popup.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #d32f2f; color: white;
    padding: 12px 16px; border-radius: 8px; z-index: 10000; font-family: Arial;
    font-size: 14px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid #b71c1c; display: flex; align-items: center; gap: 8px;
    min-width: 180px;
  `;

  const redDot = document.createElement('div');
  redDot.style.cssText = `
    width: 12px; height: 12px; background: #ff4444; border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;

  const text = document.createElement('span');
  text.id = 'recording-timer';
  text.textContent = '00:00';

  const recordingText = document.createElement('span');
  recordingText.textContent = 'Recording';

  popup.appendChild(redDot);
  popup.appendChild(text);
  popup.appendChild(recordingText);

  const style = document.createElement('style');
  style.textContent = `@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`;
  document.head.appendChild(style);
  document.body.appendChild(popup);
}

function updateRecordingTimer(time) {
  const timerElement = document.getElementById('recording-timer');
  if (timerElement) timerElement.textContent = time;
}

function hideRecordingPopup() {
  const popup = document.getElementById('recording-live-popup');
  if (popup) popup.remove();
}

// ============================================
// MUTE DETECTION (IFRAME MODE)
// ============================================
function startMicrophoneMonitoring() {
  if (!shouldHandleRecording) return;
  if (micMonitoringActive) return;
  
  console.log("🎤🎤🎤 STARTING MUTE DETECTION 🎤🎤🎤");
  micMonitoringActive = true;
  
  let lastMuteState = null;
  
  micActivityCheckInterval = setInterval(() => {
    const muteBtn = document.querySelector(
      'button[aria-label*="mute my microphone"], button[aria-label*="unmute my microphone"]'
    );
    
    if (muteBtn) {
      const label = muteBtn.getAttribute('aria-label') || '';
      const isMuted = label.toLowerCase().includes('unmute');
      
      if (isMuted !== lastMuteState) {
        lastMuteState = isMuted;
        console.log(`🎤🎤🎤 MUTE STATE: ${isMuted ? '🔇 MUTED' : '🔊 UNMUTED'} 🎤🎤🎤`);
        console.log(`  Button label: "${label}"`);
        
        chrome.runtime.sendMessage({
          action: "zoomMuteChanged",
          muted: isMuted
        });
      }
    }
  }, 300);
}

function stopMicrophoneMonitoring() {
  if (micActivityCheckInterval) {
    clearInterval(micActivityCheckInterval);
    micActivityCheckInterval = null;
  }
  micMonitoringActive = false;
}

function watchForMeetingUI() {
  if (!shouldHandleRecording) return;
  
  console.log("👀 Watching for meeting UI to load...");
  
  const observer = new MutationObserver(() => {
    const meetingFooter = document.querySelector('.footer-button-base__button, [class*="footer"]');
    if (meetingFooter && !micMonitoringActive) {
      console.log("✅ Meeting UI detected! Starting mic monitor...");
      startMicrophoneMonitoring();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ============================================
// MESSAGE LISTENER
// ============================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!shouldHandleRecording && message.action !== "updateAutoRecordPermission") {
    return; // Only process recording messages if we're in the right context
  }
  
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

  if (message.action === "updateRecordingTimer") {
    updateRecordingTimer(message.time);
    sendResponse({ success: true });
  }

  if (message.action === "showRecordingPopup") {
    showRecordingPopup();
    sendResponse({ success: true });
  }

  if (message.action === "hideRecordingPopup") {
    hideRecordingPopup();
    sendResponse({ success: true });
  }
  
  return true;
});

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('load', () => {
  if (!shouldHandleRecording) return;
  console.log("🔄 Page loaded - resetting recording states");
  resetRecordingState();
  checkAutoRecordPermission();
});

// Initial setup
setTimeout(() => {
  if (!shouldHandleRecording) {
    console.log("⏭️ Skipping initialization - not in meeting iframe");
    return;
  }
  
  console.log("🔧 Starting Auto Recorder...");
  setupEndButtonDetection();
  setupURLChangeDetection();
  
  if (isMeetingPage()) {
    console.log("📍 Already on meeting page");
    startMicrophoneMonitoring();
  } else {
    console.log("📍 On home page, watching for meeting");
    watchForMeetingUI();
  }
  
  console.log("✅ Auto Recorder initialized");
}, 1000);

// Periodic meeting detection
setInterval(() => {
  if (!shouldHandleRecording) return;
  
  // DON'T detect meeting if user just ended one
  if (meetingEndedByUser) {
    return;
  }
  
  const inMeeting = isMeetingPage();
  if (inMeeting && !isInMeeting) {
    console.log("🎯 Meeting detected (universal)");
    meetingStarted();
  }
  if (!inMeeting && isInMeeting) {
    console.log("🛑 Meeting ended (universal)");
    meetingEnded();
  }
}, 1000);

console.log("🔍 Auto Recorder content script loaded");
