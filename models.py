import os
import base64
import mimetypes
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# 1. Load Environment Variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    print("⚠️  WARNING: HF_TOKEN is missing. Check your .env file.")

# 2. Initialize Shared Client (Fixes 'api_key' vs 'token' error)
client = InferenceClient(token=HF_TOKEN)

# 3. Define Models
# We use Phi-3 for text because it is more reliable on the free tier than Mistral
LLM_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai" 
VLM_MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct"

def generate_text_response(prompt: str) -> str:
    """Handles Text-Only Chat"""
    print("🧠 LLM Thinking...")
    try:
        completion = client.chat.completions.create(
            model=LLM_MODEL_ID,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "I'm having trouble connecting to the text AI right now."

def generate_vision_response(prompt: str, image_path: str) -> str:
    """Handles Image + Text Chat"""
    print("👁️ VLM Thinking...")
    try:
        # Determine Mime Type (jpg/png)
        mime_type, _ = mimetypes.guess_type(image_path)
        if mime_type is None:
            mime_type = "image/jpeg"

        # Encode image to Base64
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Send to Vision Model
        completion = client.chat.completions.create(
            model=VLM_MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{image_base64}"}
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ VLM Error: {e}")
        return "I'm having trouble analyzing this image right now."