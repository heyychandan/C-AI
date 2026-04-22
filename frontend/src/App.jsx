import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const SESSION_ID = uuidv4();

function App() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hey! I'm your AI assistant. Ask me anything, or upload a PDF to chat with it! 👋" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("chat"); // "chat" or "pdf"
    const [pdfName, setPdfName] = useState(null);
    const [uploading, setUploading] = useState(false);
    const bottomRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8000/chat", {
                session_id: SESSION_ID,
                message: input,
                mode: mode,
            });
            setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error connecting to backend." }]);
        } finally {
            setLoading(false);
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessages(prev => [...prev, { role: "assistant", content: `📄 Uploading "${file.name}"...` }]);

        const formData = new FormData();
        formData.append("session_id", SESSION_ID);
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:8000/upload-pdf", formData);
            setPdfName(file.name);
            setMode("pdf");
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `✅ PDF processed! (${res.data.chunks} chunks indexed)\n\nNow ask me anything about "${file.name}"!`
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to upload PDF." }]);
        } finally {
            setUploading(false);
        }
    };

    const clearChat = async () => {
        await axios.post("http://localhost:8000/clear", { session_id: SESSION_ID });
        setMessages([{ role: "assistant", content: "Chat cleared! Fresh start 🧹" }]);
        setMode("chat");
        setPdfName(null);
    };

    return (
        <div className="app">
            <header>
                <h1>🤖 AI Assistant</h1>
                <div className="header-right">
                    {pdfName && (
                        <span className="pdf-badge">📄 {pdfName}</span>
                    )}
                    <button onClick={() => fileRef.current.click()} className="upload-btn" disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload PDF"}
                    </button>
                    <button onClick={clearChat} className="clear-btn">Clear</button>
                </div>
            </header>

            <input
                type="file"
                accept=".pdf"
                ref={fileRef}
                onChange={handlePdfUpload}
                style={{ display: "none" }}
            />

            {mode === "pdf" && (
                <div className="mode-bar">
                    💬 PDF Mode — asking about: <strong>{pdfName}</strong>
                    <button onClick={() => setMode("chat")} className="switch-btn">Switch to Chat</button>
                </div>
            )}

            <div className="chat-window">
                {messages.map((msg, i) => (
                    <div key={i} className={`bubble ${msg.role}`}>
                        <span>{msg.content}</span>
                    </div>
                ))}
                {loading && <div className="bubble assistant"><span>Thinking...</span></div>}
                <div ref={bottomRef} />
            </div>

            <div className="input-bar">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder={mode === "pdf" ? "Ask about your PDF..." : "Type a message..."}
                />
                <button onClick={sendMessage} disabled={loading}>Send</button>
            </div>
        </div>
    );
}

export default App;