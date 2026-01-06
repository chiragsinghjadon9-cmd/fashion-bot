import os
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# ✅ IMPORT FROM THE NEW UNIFIED FILE
from models import generate_text_response, generate_vision_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    # 📸 IMAGE PROCESSING (Vision)
    if image:
        print(f"📸 Image received: {image.filename}")
        
        # Save temp file
        file_location = f"temp_{image.filename}"
        with open(file_location, "wb") as f:
            f.write(await image.read()) # Added await here for safety

        # Default prompt if user didn't type anything
        prompt = text.strip() if text and text.strip() else "Describe this fashion item and suggest matching outfits."

        # Call the VLM function from models.py
        response_text = generate_vision_response(prompt, file_location)
        
        # Cleanup: Delete the temp file after processing
        if os.path.exists(file_location):
            os.remove(file_location)
            
        return {"reply": response_text}

    # 💬 TEXT PROCESSING (LLM)
    if text:
        print(f"💬 Text received: {text}")
        response_text = generate_text_response(text)
        return {"reply": response_text}

    return {"reply": "Please upload an image or type a fashion question."}