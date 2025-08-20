import pyttsx3
import textwrap
import os

# Initialize TTS engine
engine = pyttsx3.init()

# Optional: Set voice and speed
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)  # 0=default male, 1=female (varies by system)
engine.setProperty('rate', 150)  # Speech speed

# Get text input (you can also hardcode a string)
text_to_speak = input("\n📝 Enter the text you want to convert to speech:\n")

# Wrap text nicely for display
formatted_text = textwrap.fill(text_to_speak, width=50)
print("\n📄 Your input text:\n")
print(formatted_text, "\n")

# Output file path
output_file = "output_audio.mp3"

# Save speech to file
engine.save_to_file(text_to_speak, output_file)
engine.runAndWait()

print(f"\n🔊 TTS audio saved as '{output_file}'\n")
