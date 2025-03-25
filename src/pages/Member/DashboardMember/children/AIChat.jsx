// AIChat.jsx
import React, { useState, useEffect, useRef } from "react";
import "./AIChat.css";

const AIChat = ({ isOpen, onClose, selectedChild }) => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I'm BabyHaven AI, here to assist you on your parenting journey. How can I help you today?",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { sender: "User", text: newMessage };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const response = await sendMessageToAI(newMessage, selectedChild);
      const aiMessage = { sender: "AI", text: response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "AI",
        text: "Sorry, an error occurred. Please try again!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessageToAI = async (message, child) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `I've analyzed the data for ${child?.name || "your child"}. Would you like to know more about nutrition or development?`
        );
      }, 1500);
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([
        {
          sender: "AI",
          text: "Hello! I'm BabyHaven AI, here to assist you on your parenting journey. How can I help you today?",
        },
      ]);
      setNewMessage("");
      setIsTyping(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h3>Chat with BabyHaven AI</h3>
          <button className="chat-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === "User" ? "user" : "ai"}`}
            >
              {msg.sender === "AI" && <span className="chat-avatar">🤖</span>}
              <div className="chat-text">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message ai">
              <span className="chat-avatar">🤖</span>
              <div className="chat-text typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={handleSendMessage} className="chat-send-btn">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;