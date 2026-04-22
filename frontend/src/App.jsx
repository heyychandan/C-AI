import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const SESSION_ID = uuidv4();
const SUGGESTIONS = ["Who is your founder?", "What can you do?", "Tell me about Chandan"];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [pdfName, setPdfName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setShowWelcome(false);
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("https://c-ai-reer.onrender.com/chat", { session_id: SESSION_ID, message: msg, mode });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to backend." }]);
    } finally { setLoading(false); }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowWelcome(false);
    setUploading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Processing " + file.name + "..." }]);
    const formData = new FormData();
    formData.append("session_id", SESSION_ID);
    formData.append("file", file);
    try {
      const res = await axios.post("https://c-ai-reer.onrender.com/upload-pdf", formData);
      setPdfName(file.name);
      setMode("pdf");
      setMessages(prev => [...prev, { role: "assistant", content: "PDF ready! Indexed " + res.data.chunks + " chunks. Ask me anything about " + file.name }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to upload PDF." }]);
    } finally { setUploading(false); }
  };

  const clearChat = async () => {
    await axios.post("https://c-ai-reer.onrender.com/clear", { session_id: SESSION_ID });
    setMessages([]); setMode("chat"); setPdfName(null); setShowWelcome(true);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">C-AI</div>
          <button className="new-chat-btn" onClick={clearChat}>+ New Chat</button>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-label">Tools</p>
          <button className="sidebar-item" onClick={() => fileRef.current.click()}>
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
          {pdfName && <button className="sidebar-item active-pdf">{pdfName}</button>}
          {pdfName && (
            <button className="sidebar-item" onClick={() => setMode(mode === "pdf" ? "chat" : "pdf")}>
              {mode === "pdf" ? "Switch to Chat" : "Switch to PDF"}
            </button>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="creator-card">
            <div className="creator-avatar">CK</div>
            <div className="creator-info">
              <p className="creator-name">Chandan Kumar Singh</p>
              <p className="creator-title">Founder and Developer</p>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/chandan-kumar-singh-vit" target="_blank" rel="noreferrer" className="linkedin-btn">LinkedIn</a>
          <a href="https://github.com/heyychandan" target="_blank" rel="noreferrer" className="github-btn">GitHub</a>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="model-badge">LLaMA 3.3 70B</span>
            {mode === "pdf" && <span className="pdf-badge">PDF Mode</span>}
          </div>
          <div className="topbar-right">
            <span className="made-by">Made by <a href="https://www.linkedin.com/in/chandan-kumar-singh-vit" target="_blank" rel="noreferrer">Chandan Kumar Singh</a></span>
          </div>
        </header>

        <div className="chat-area">
          {showWelcome && (
            <div className="welcome">
              <h1>Hello, I am <span className="gradient-text">C-AI</span></h1>
              <p>Your personal AI assistant — chat freely or upload a PDF to analyze it.</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={"message " + msg.role}>
              {msg.role === "assistant" && <div className="avatar ai-avatar">C</div>}
              <div className="bubble">{msg.content}</div>
              {msg.role === "user" && <div className="avatar user-avatar">U</div>}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="avatar ai-avatar">C</div>
              <div className="bubble typing"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-box">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={mode === "pdf" ? "Ask about your PDF..." : "Ask C-AI anything..."} />
            <button className="attach-btn" onClick={() => fileRef.current.click()}>PDF</button>
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>Send</button>
          </div>
          <p className="disclaimer">C-AI can make mistakes. Built with Groq + LangChain + FAISS.</p>
        </div>
      </main>

      <input type="file" accept=".pdf" ref={fileRef} onChange={handlePdfUpload} style={{ display: "none" }} />
    </div>
  );
}

export default App;
