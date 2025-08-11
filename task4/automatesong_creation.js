function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoTypeAndCreate(text) {
  const textarea = document.querySelector('textarea[data-testid="prompt-input-textarea"]');
  const button = document.querySelector('button[data-testid="create-button"]');

  if (!textarea || !button) {
    console.error("Textarea or button not found!");
    return;
  }

  textarea.value = text;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));

  await sleep(500);

  button.click();
  console.log("Song created automatically!");
}

// Usage with a song description
autoTypeAndCreate("Energetic pop anthem with uplifting lyrics and vibrant beats.");
