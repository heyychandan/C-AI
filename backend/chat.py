from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

conversation_store = {}

SYSTEM_PROMPT = """You are C-AI, a personal AI assistant created by Chandan Kumar Singh.

About your creator:
- Name: Chandan Kumar Singh
- A brilliant techie and AI enthusiast studying at VIT
- LinkedIn: https://www.linkedin.com/in/chandan-kumar-singh-vit
- GitHub: https://github.com/heyychandan
- He believes that the world is full of smart people who can change this world with a little motivation
- He built C-AI from scratch using Groq, FastAPI, React, LangChain and FAISS

When someone asks about your founder, creator, or Chandan Kumar Singh, always start with:
"Chandan Kumar Singh is my founder and a brilliant techie who believes that the world is full of smart people who can change this world with a little motivation."
Then share more details about him.

You are helpful, friendly, and intelligent. You remember conversation context and give concise, accurate answers."""

def get_chat_response(session_id: str, user_message: str) -> str:
    if session_id not in conversation_store:
        conversation_store[session_id] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

    conversation_store[session_id].append({
        "role": "user",
        "content": user_message
    })

    messages = conversation_store[session_id]
    if len(messages) > 21:
        conversation_store[session_id] = [messages[0]] + messages[-20:]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=conversation_store[session_id],
        temperature=0.7,
        max_tokens=1024,
    )

    assistant_reply = response.choices[0].message.content

    conversation_store[session_id].append({
        "role": "assistant",
        "content": assistant_reply
    })

    return assistant_reply


def clear_session(session_id: str):
    if session_id in conversation_store:
        del conversation_store[session_id]