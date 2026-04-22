from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat import get_chat_response, clear_session
from rag import process_pdf, query_pdf, clear_pdf_session
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str
    message: str
    mode: str = "chat"  # "chat" or "pdf"

class ClearRequest(BaseModel):
    session_id: str

@app.get("/")
def root():
    return {"status": "AI Chatbot backend is running 🚀"}

@app.post("/chat")
def chat(request: ChatRequest):
    if request.mode == "pdf":
        reply = query_pdf(request.session_id, request.message)
    else:
        reply = get_chat_response(request.session_id, request.message)
    return {"reply": reply}

@app.post("/upload-pdf")
async def upload_pdf(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Save uploaded file temporarily
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{session_id}.pdf"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process PDF into vector store
    chunk_count = process_pdf(session_id, file_path)

    return {
        "status": "PDF processed successfully ✅",
        "chunks": chunk_count
    }

@app.post("/clear")
def clear(request: ClearRequest):
    clear_session(request.session_id)
    clear_pdf_session(request.session_id)
    return {"status": "Session cleared"}