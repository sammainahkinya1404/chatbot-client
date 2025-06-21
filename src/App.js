import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function App() {
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem("session_id");
    if (saved) return saved;
    const newId = generateSessionId();
    localStorage.setItem("session_id", newId);
    return newId;
  });

  // Scroll to bottom on message update
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      console.log("🔁 Sending message to backend:", userInput);

      const response = await fetch("https://backend-c1uq.onrender.com/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      console.log("✅ Received response:", data);

      const botMessage = {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process your request.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("❌ Server error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server error. Try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const newId = generateSessionId();
    localStorage.setItem("session_id", newId);
    localStorage.removeItem("chat_history");
    setSessionId(newId);
    setMessages([]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        💼 Kenya Business Assistant
        <button className="reset-btn" onClick={handleReset}>
          Reset Chat
        </button>
      </header>

      <div className={`connection-status ${isLoading ? "loading" : ""}`}>
        {isLoading ? "⏳ Talking to assistant..." : "✅ Ready"}
      </div>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble assistant loading">Typing...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
