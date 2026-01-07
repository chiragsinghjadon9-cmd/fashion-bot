import os
from typing import Optional

from fastapi import FastAPI, Form, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# ✅ IMPORT YOUR MODEL FUNCTIONS
from models import generate_text_response, generate_vision_response

app = FastAPI()

# ✅ CORS (safe for Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FRONTEND SETUP
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ✅ HOME PAGE
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.head("/")
async def head_root():
     return HTMLResponse(status_code=200)
    
# ✅ CHAT API (UNCHANGED LOGIC)
@app.post("/chat")
async def chat(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    # 📸 IMAGE → VLM
    if image:
        file_location = f"temp_{image.filename}"

        with open(file_location, "wb") as f:
            f.write(await image.read())

        prompt = text.strip() if text and text.strip() else (
            "Describe this fashion item and suggest matching outfits."
        )

        response_text = generate_vision_response(prompt, file_location)

        if os.path.exists(file_location):
            os.remove(file_location)

        return {"reply": response_text}

    # 💬 TEXT → LLM
    if text:
        response_text = generate_text_response(text)
        return {"reply": response_text}

    return {"reply": "Please upload an image or type a fashion question."}
