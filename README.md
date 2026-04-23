# 🤖 C-AI — Your Personal AI Assistant

> A full-stack AI chatbot with RAG (Retrieval-Augmented Generation) — chat with any PDF using natural language.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Groq](https://img.shields.io/badge/Groq-LLaMA3.3-orange)
![FAISS](https://img.shields.io/badge/FAISS-VectorDB-red)

---

## ✨ Features

- 💬 **AI Chat** — Conversational AI with memory using Groq LLaMA 3.3 70B
- 📄 **PDF Upload & RAG** — Upload any PDF and ask questions about it
- 🧠 **Vector Search** — FAISS vector database for semantic search
- ⚡ **Fast Responses** — Powered by Groq's ultra-fast inference
- 🔄 **Session Memory** — Remembers conversation context
- 🎨 **Clean UI** — Modern dark-themed React frontend

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| AI Model | Groq LLaMA 3.3 70B |
| Embeddings | HuggingFace all-MiniLM-L6-v2 |
| Vector DB | FAISS |
| RAG Framework | LangChain |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

---

## ⚠️ Usage & License

This project is for portfolio purposes only.  
Please do not copy or reproduce without explicit permission from the author.

© 2026 Chandan Kumar Singh — All rights reserved.
