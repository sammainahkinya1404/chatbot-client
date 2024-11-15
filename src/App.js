import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to the chat
    const newMessage = { role: "user", content: userInput };
    setMessages([...messages, newMessage]);

    // Clear input field
    setUserInput("");
    setIsLoading(true);

    try {
      // Make API call directly to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Load key from .env
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Replace with your model
          messages: [
            { role: "system", content: "You are a bot focused on business and investment ideas in Kenya." },
            ...messages,
            newMessage,
          ],
        }),
      });

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.choices[0].message.content };
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
