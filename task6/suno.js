(async function autoDownloadCreateAndWatch() {
  console.log("🎵 Starting automation...");

  // === Helpers ===
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  const waitForElement = async (selector, timeout = 10000, root = document) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = root.querySelector(selector);
      if (el) return el;
      await wait(200);
    }
    return null;
  };

  const simulateUserClick = (element) => {
    ["pointerdown", "mousedown", "mouseup", "click"].forEach(eventType => {
      element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true }));
    });
  };

  function setReactValue(el, value) {
    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

 
  // === Step 2: Create a New Song ===
  const title = "Moonlight";

  const titleBox = await waitForElement('input[placeholder="Enter song title"]');
  if (titleBox) {
    setReactValue(titleBox, title);
    console.log("✅ Title filled!");
  }

  const lyricsBox = await waitForElement('textarea[data-testid="lyrics-input-textarea"]');
  if (lyricsBox) {
    setReactValue(lyricsBox, `Under the silver moon, the waves softly sing,
The night carries whispers the daylight can't bring.
Stars paint the sky with a shimmering hue,
And every beat of my heart dances for you.`);
    console.log("✅ Lyrics filled!");
  }

  const stylesBox = await waitForElement('textarea[data-testid="tag-input-textarea"]');
  if (stylesBox) {
    setReactValue(stylesBox, "metal, basso, megabass");
    console.log("✅ Styles filled!");
  }

  const createButton = await waitForElement('button[data-testid="create-button"]');
  if (createButton && !createButton.disabled) {
    createButton.click();
    console.log("🎯 Create button clicked!");
  } else {
    console.error("❌ Create button not found or disabled!");
    return;
  }

  // === Step 3: Watch for Song Row and then Publish button (no clicking) ===
console.log("👀 Watching for new song row...");

const workspace = await waitForElement('.custom-scrollbar-transparent.flex-1.overflow-y-auto');
if (!workspace) {
  console.error("❌ Workspace not found!");
  return;
}

const rowObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1 && node.matches('[role="row"]')) {
        const label = node.getAttribute("aria-label");
        if (label === title) {
          console.log(`🎶 New song "${title}" row detected!`);

          // Only observe this *newly added row*
          const publishObserver = new MutationObserver(async (mutations2) => {
            for (const mut2 of mutations2) {
              for (const node2 of mut2.addedNodes) {
                if (node2.nodeType === 1) {
                  const publishSpans = node2.querySelectorAll("button span");
                  for (const span of publishSpans) {
                    if (span.textContent.trim() === "Publish") {
                      console.log(`✅ The song "${title}" is fully created (Publish button visible)!`);

                      // 🎤 Fetch Title & Lyrics
                      const finalTitle = document.querySelector('input[placeholder="Enter song title"]')?.value || "(unknown title)";
                      const finalLyrics = document.querySelector('textarea[data-testid="lyrics-input-textarea"]')?.value || "(no lyrics)";
                      console.log("📌 Final Song Data:");
                      console.log("Title:", finalTitle);
                      console.log("Lyrics:", finalLyrics);

                      // === 📥 Now trigger download for THIS new song ===
                      const optionsButton = node.querySelector('button[aria-label="More Options"]');
                      if (optionsButton) {
                        simulateUserClick(optionsButton);
                        await wait(400);

                        const downloadOption = await waitForElement('[data-testid="download-sub-trigger"]', 5000, node)
                          || Array.from(document.querySelectorAll('span, button'))
                            .find(el => el.textContent.trim().toLowerCase() === "download");
                        if (downloadOption) {
                          simulateUserClick(downloadOption);
                          console.log("⬇️ Download initiating...");
                          await wait(400);

                          const mp3Option = Array.from(document.querySelectorAll("button, [role='menuitem'], span"))
                            .find(el => el.textContent.toLowerCase().includes("mp3 audio"));
                          if (mp3Option) {
                            simulateUserClick(mp3Option);
                            console.log("🎼 MP3 chosen");
                            await wait(400);

                            const confirmDownload = Array.from(document.querySelectorAll("button"))
                              .find(el => el.textContent.toLowerCase().includes("download anyway"));
                            if (confirmDownload) {
                              simulateUserClick(confirmDownload);
                              console.log("✅ Download confirmed");
                            }
                          }
                        }
                      }

                      publishObserver.disconnect();
                      return;
                    }
                  }
                }
              }
            }
          });

          publishObserver.observe(node, { childList: true, subtree: true });
          rowObserver.disconnect(); // stop watching for more rows
        }
      }
    }
  }
});

rowObserver.observe(workspace, { childList: true, subtree: true });

})();
