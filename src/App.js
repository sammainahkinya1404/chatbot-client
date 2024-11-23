import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
  
    const newMessage = { role: "user", content: userInput };
    setMessages([...messages, newMessage]);
  
    setUserInput("");
    setIsLoading(true);
  
    try {
      const response = await fetch("https://backend-c1uq.onrender.com/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      const botMessage = { role: "assistant", content: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  


  return (
    <div className="App">
      <h1>Kenyan Business Ideas & Investment Bot</h1>
      <div className="chatbox">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === "user" ? "You" : "Bot"}:</strong> {message.content}
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          placeholder="Ask about business ideas in Kenya..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
