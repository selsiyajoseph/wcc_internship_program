// Utility function to update React-controlled inputs/textarea
function updateReactInput(element, value) {
  const proto = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

// Simulate a real click
function simulateClick(el) {
  ["pointerdown", "mousedown", "mouseup", "click"].forEach(evt =>
    el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }))
  );
}

// Watch for a new song in the song list
function watchForNewSong(callback) {
  const container = document.querySelector(".react-aria-GridList");
  if (!container) {
    console.error("Unable to locate song list container.");
    return;
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains("react-aria-GridListItem")) {
          console.log("New song entry detected.");

          const poll = setInterval(() => {
            const titleElem = node.querySelector('span.line-clamp-1[title]');
            const title = titleElem?.getAttribute("title") || "";

            if (title && title !== "Untitled") {
              clearInterval(poll);
              observer.disconnect();
              callback(node);
            }
          }, 200);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
}

// Function to download a song
function downloadSong(songNode) {
  try {
    // Click More Options
    const moreBtn = songNode.querySelector('button[aria-label*="More Options"]');
    if (!moreBtn) throw "More Options button not found!";
    simulateClick(moreBtn);

    setTimeout(() => {
      // Click Download
      const downloadBtn = Array.from(document.querySelectorAll('button, span'))
        .find(el => el.textContent.toLowerCase().includes("download"));
      if (!downloadBtn) throw "Download button not found!";
      simulateClick(downloadBtn);

      setTimeout(() => {
        // Click MP3 Audio
        const mp3Btn = Array.from(document.querySelectorAll('button, span'))
          .find(el => el.textContent.toLowerCase().includes("mp3 audio"));
        if (!mp3Btn) throw "MP3 Audio button not found!";
        simulateClick(mp3Btn);

        setTimeout(() => {
          // Click Download Anyway
          const downloadAnywayBtn = Array.from(document.querySelectorAll('button'))
            .find(el => el.textContent.toLowerCase().includes("download anyway"));
          if (downloadAnywayBtn) simulateClick(downloadAnywayBtn);

          console.log("✅ New song download triggered!");
        }, 500);
      }, 500);
    }, 500);

  } catch (err) {
    console.error("❌ Error downloading song:", err);
  }
}

// Main automation
function runSongAutomation() {
  const lyricsInput = document.querySelector('textarea[data-testid="lyrics-input-textarea"]');
  const styleInput = document.querySelector('textarea[data-testid="tag-input-textarea"]');
  const titleInput = document.querySelector('input[placeholder="Enter song title"]');
  const createButton = document.querySelector('button[data-testid="create-button"]');

  if (!lyricsInput || !styleInput || !titleInput || !createButton) {
    console.error("One or more necessary inputs or buttons are missing.");
    return;
  }

  // Fill song details
  const songDetails = {
    lyrics: "Golden waves crash on silver sands, the horizon sings with the colors of goodbye.",
    style: "Cinematic Indie Rock",
    title: "Horizon Goodbye"
  };

  updateReactInput(lyricsInput, songDetails.lyrics);
  updateReactInput(styleInput, songDetails.style);
  updateReactInput(titleInput, songDetails.title);

  // Watch for the newly created song
  watchForNewSong(downloadSong);

  // Click Create when ready
  const checkButtonEnabled = setInterval(() => {
    if (!createButton.disabled) {
      clearInterval(checkButtonEnabled);
      createButton.click();
      console.log("▶ 'Create' clicked! Waiting for song to appear...");
    }
  }, 100);
}

// Start automation
runSongAutomation();
