import whisper
import textwrap
import os

# Path to local Whisper model cache
model_cache_dir = os.path.expanduser("~/.cache/whisper")
model_file = os.path.join(model_cache_dir, "tiny.pt")

# Ensure cache folder exists
os.makedirs(model_cache_dir, exist_ok=True)

# Check if model file exists
if os.path.exists(model_file):
    print("\n✅ Using local Whisper model from cache...\n")
    model = whisper.load_model("tiny", download_root=model_cache_dir)
else:
    print("\n⚠️ Model not found locally. Downloading now...\n")
    model = whisper.load_model("tiny", download_root=model_cache_dir)

# Path to audio file (use relative path if in same folder)
audio_file = "audio.mp3"

# Transcription
print(f"\n🔊 Transcribing {audio_file}...\n")
result = model.transcribe(audio_file)

# Format transcription nicely
raw_text = result["text"]
formatted_text = textwrap.fill(raw_text, width=50)

print("\n📝 Transcription result:\n")
print("\n", formatted_text, "\n")
