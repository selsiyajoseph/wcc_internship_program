async function observeSongCreationAsync() {
  // Helper function to delay for a bit (optional, useful if you want to debounce)
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Select the target node to observe (whole body here)
  const targetNode = document.body;

  // Create the observer
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.textContent && node.textContent.toLowerCase().includes("song")) {
              console.log(" New song detected:", node.textContent.trim());
            }
          }
        });
      }
    }
  });

  // Start observing
  observer.observe(targetNode, { childList: true, subtree: true });
  console.log("MutationObserver is now watching!!!");

 
}

// Run the observer
observeSongCreationAsync();
