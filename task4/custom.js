// Utility function to update React-controlled inputs/textarea
function updateReactInput(element, value) {
  const proto = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

// Monitor the song list for new songs
function watchForNewSongs(callback) {
  const container = document.querySelector(".react-aria-GridList");
  if (!container) {
    console.error("Unable to locate song list container.");
    return;
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains("react-aria-GridListItem")) {
          console.log("New song entry detected.");

          const poll = setInterval(() => {
            const titleElem = node.querySelector('span.line-clamp-1[title]');
            const lyricsElem = node.querySelector('div[data-testid="lyrics"]');
            const title = titleElem?.getAttribute("title") || "";
            const lyrics = lyricsElem?.innerText || "";

            if (title && title !== "Untitled") {
              callback({ title, lyrics });
              clearInterval(poll);
              observer.disconnect();
            }
          }, 200);
        }
      });
    });
  });

  observer.observe(container, { childList: true, subtree: true });
}

// Main automation function to fill and submit song data
function runSongAutomation() {
  const lyricsInput = document.querySelector('textarea[data-testid="lyrics-input-textarea"]');
  const styleInput = document.querySelector('textarea[data-testid="tag-input-textarea"]');
  const titleInput = document.querySelector('input[placeholder="Enter song title"]');
  const createButton = document.querySelector('button[data-testid="create-button"]');

  if (!lyricsInput || !styleInput || !titleInput || !createButton) {
    console.error(" One or more necessary inputs or buttons are missing.");
    return;
  }

  const songDetails = {
    lyrics: "Golden waves crash on silver sands, the horizon sings with the colors of goodbye.",
    style: "Cinematic Indie Rock",
    title: "Horizon Goodbye"
  };

  updateReactInput(lyricsInput, songDetails.lyrics);
  updateReactInput(styleInput, songDetails.style);
  updateReactInput(titleInput, songDetails.title);

  watchForNewSongs(song => console.log("🎵 Song generated:", song));

  const checkButtonEnabled = setInterval(() => {
    if (!createButton.disabled) {
      clearInterval(checkButtonEnabled);
      createButton.click();
    }
  }, 100);
}

// Start the automation
runSongAutomation();