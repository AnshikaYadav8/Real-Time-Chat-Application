import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  const receiveSound = new Audio("/receive.mp3");

  useEffect(() => {
  socket.on("receive_message", (data) => {
    if (data.username !== username) {
      receiveSound.play();
      setChat((prev) => [...prev, { ...data, type: "received" }]);
    } else {
      setChat((prev) => [...prev, { ...data, type: "sent" }]);
    }
  });

  return () => socket.off("receive_message");
}, [username]);

  const handleSend = () => {
    if (!message.trim()) return;
    const msgObj = { username, message };
    setChat((prev) => [...prev, { ...msgObj, type: "sent" }]);
    socket.emit("send_message", msgObj);
    setMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleLogin = () => {
    if (username.trim()) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleLogin}>Enter Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="header">Welcome, {username}</div>
      <div className="messages">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.type === "sent" ? "sent" : "received"}`}
          >
            <div className="bubble">{msg.message}</div>
            <div className="sender">{msg.username}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="input-box">
        <input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
