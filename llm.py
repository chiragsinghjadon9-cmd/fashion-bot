# llm.py

import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load .env variables
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise ValueError("❌ HF_TOKEN not found. Check your .env file.")

# Create HF client
client = InferenceClient(token=HF_TOKEN)

# Mistral model (works on HF Inference API)
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"

def generate_text_response(prompt: str) -> str:
    print("🧠 Mistral LLM is thinking...")

    try:
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "Sorry, I couldn't generate a response."
