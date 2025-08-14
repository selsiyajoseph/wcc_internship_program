async function automateMusicDownloadAndCreation() {
  console.log(".");

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const findElement = async (selector, root = document, timeout = 6000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = root.querySelector(selector);
      if (element) return element;
      await delay(100);
    }
    return null;
  };

  const simulateUserClick = (element) => {
    ["pointerdown", "mousedown", "mouseup", "click"].forEach(eventType => {
      element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true }));
    });
  };

  const updateReactInput = (inputEl, value) => {
    const proto = Object.getPrototypeOf(inputEl);
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(inputEl, value);
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const waitForButtonEnable = (label, callback) => {
    const checkInterval = setInterval(() => {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent.trim() === label);
      if (btn && !btn.disabled) {
        clearInterval(checkInterval);
        console.log(`'${label}' button is now active!`);
        callback();
      }
    }, 1200);
  };

  try {
    // Step 1: Choose the first song in the list
    const songGrid = await findElement(".react-aria-GridList");
    if (!songGrid) throw new Error("Song grid not detected!");
    const firstSongItem = songGrid.querySelector("[role='row'], .react-aria-GridListItem");
    if (!firstSongItem) throw new Error(" No songs available!");
    simulateUserClick(firstSongItem);
    console.log("🎶 First song selected");
    await delay(400);

    // Step 2: Open More Options
    const optionsButton = firstSongItem.querySelector('button[aria-label="More Options"]');
    if (!optionsButton) throw new Error(" Could not find More Options button!");
    simulateUserClick(optionsButton);
    console.log(" More Options opened");
    await delay(400);

    // Step 3: Download song
    const downloadOption = await findElement('[data-testid="download-sub-trigger"]') 
                        || Array.from(document.querySelectorAll('span, button'))
                                .find(el => el.textContent.trim().toLowerCase() === "download");
    if (!downloadOption) throw new Error("Download option missing!");
    simulateUserClick(downloadOption);
    console.log("⬇ Download initiated");
    await delay(400);

    // Step 4: Select MP3 format
    const mp3Option = Array.from(document.querySelectorAll("button, [role='menuitem'], span"))
      .find(el => el.textContent.toLowerCase().includes("mp3 audio"));
    if (!mp3Option) throw new Error("MP3 option not found!");
    simulateUserClick(mp3Option);
    console.log("🎧 MP3 format chosen");
    await delay(400);

    // Step 5: Confirm Download Anyway
    const confirmDownload = Array.from(document.querySelectorAll("button"))
      .find(el => el.textContent.toLowerCase().includes("download anyway"));
    if (!confirmDownload) throw new Error("'Download Anyway' missing!");
    simulateUserClick(confirmDownload);
    console.log("MP3 download confirmed");
    await delay(400);

    console.log("🎉 Download complete! Moving to song creation...");

    // Step 6: Create a new song
    const lyricsInput = document.querySelector('textarea[data-testid="lyrics-input-textarea"]');
    const styleInput = document.querySelector('textarea[data-testid="tag-input-textarea"]');
    const titleInput = document.querySelector('input[placeholder="Enter song title"]');
    const createButton = document.querySelector('button[data-testid="create-button"]');

    if (!lyricsInput || !styleInput || !titleInput || !createButton) {
      console.error(" Required fields/buttons for song creation not found!");
      return;
    }

    const newLyrics = 
      "Walking through the quiet streets at midnight,\n" +
      "Your shadow dances softly under the lights,\n" +
      "Every word you say becomes a tune,\n" +
      "I hum along to the rhythm of the moon.\n\n" +
      "Our laughter echoes through the empty square,\n" +
      "Moments like this are beyond compare,\n" +
      "If time pauses here, I’ll keep the melody alive,\n" +
      "Every beat reminds me that we’re alive.";

    const newStyle = "Indie, Chill, Acoustic Vibes, Soft Guitar";
    const newTitle = "Midnight Whispers";

    updateReactInput(lyricsInput, newLyrics);
    updateReactInput(styleInput, newStyle);
    updateReactInput(titleInput, newTitle);

    waitForButtonEnable("Publish", () => {
      const songData = {
        title: titleInput.value.trim(),
        lyrics: lyricsInput.value.trim(),
        style: styleInput.value.trim()
      };
      console.log("Song details ready:", songData);
      console.log("Song setup complete!");
    });

    const autoClickCreate = setInterval(() => {
      if (!createButton.disabled) {
        clearInterval(autoClickCreate);
        console.log("Pressing 'Create' to finalize song...");
        createButton.click();
      }
    }, 250);

  } catch (error) {
    console.error("Automation error occurred:", error);
  }
}

// Execute the automation
automateMusicDownloadAndCreation();

