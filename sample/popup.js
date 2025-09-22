let mediaRecorder;
let recordedChunks = [];

document.getElementById('startBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabCapture.capture({ video: true, audio: true }, stream => {
    if (!stream) {
      alert('Unable to capture tab. Make sure you are on a Teams tab.');
      return;
    }

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => downloadRecording();
    mediaRecorder.start();

    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  mediaRecorder.stop();
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
});

function downloadRecording() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: 'teams_recording.webm'
  });
  recordedChunks = [];
}
