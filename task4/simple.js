(() => {
  const promptText = "A high-energy EDM track with futuristic vibes and deep bass drops";

  function fillPromptAndSubmit(text) {
    const inputBox = document.querySelector('textarea[data-testid="prompt-input-textarea"]');
    const createButton = document.querySelector('button[data-testid="create-button"]');

    if (!inputBox || !createButton) {
      console.error("Could not find the input or create button.");
      return;
    }

    inputBox.value = text;
    inputBox.dispatchEvent(new Event("input", { bubbles: true }));

    trackSongCreation((title) => {
      console.log("Song generated:", title);
    });

    createButton.click();
  }

  function trackSongCreation(onSongReady) {
    const listContainer = document.querySelector(".react-aria-GridList");
    if (!listContainer) {
      console.error("Song list area not found.");
      return;
    }

    const watcher = new MutationObserver(mutationList => {
      for (const mutation of mutationList) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.classList.contains("react-aria-GridListItem")) {
            console.log("Detected new song entry...");

            const waitForData = setInterval(() => {
              const songTitle = node.querySelector('span.line-clamp-1[title]')?.getAttribute("title") || "";

              if (songTitle && songTitle !== "Untitled") {
                onSongReady(songTitle);
                clearInterval(waitForData);
                watcher.disconnect();
              }
            }, 200);
          }
        });
      }
    });

    watcher.observe(listContainer, { childList: true, subtree: true });
  }

  // Run the flow
  fillPromptAndSubmit(promptText);
})();
