import openai
import os
import tkinter as tk
from tkinter import scrolledtext

# API Setup
api_key = os.getenv("OPENROUTER_API_KEY")
openai.api_key = api_key
openai.api_base = "https://openrouter.ai/api/v1"

messages = [{"role": "system", "content": "You are a helpful assistant."}]

def send_message():
    user_input = entry.get()
    if not user_input.strip():
        return
    
    chat_box.insert(tk.END, f"You: {user_input}\n")
    entry.delete(0, tk.END)

    messages.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="openai/gpt-3.5-turbo",  # You can change model here
            messages=messages,
            max_tokens=500
        )
        reply = response["choices"][0]["message"]["content"].strip()
        chat_box.insert(tk.END, f"AI: {reply}\n\n")
        messages.append({"role": "assistant", "content": reply})
    except Exception as e:
        chat_box.insert(tk.END, f"⚠️ Error: {str(e)}\n\n")

# Tkinter UI
root = tk.Tk()
root.title("Chatbot with OpenRouter AI")
root.geometry("500x600")

chat_box = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=60, height=25)
chat_box.pack(padx=10, pady=10)

entry = tk.Entry(root, width=40)
entry.pack(side=tk.LEFT, padx=10, pady=10)

send_button = tk.Button(root, text="Send", command=send_message)
send_button.pack(side=tk.LEFT)

root.mainloop()
