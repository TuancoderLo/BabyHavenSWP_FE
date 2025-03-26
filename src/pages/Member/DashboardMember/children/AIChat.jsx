// AIChat.jsx
import React, { useState, useEffect, useRef } from "react";
import childApi from "../../../../services/childApi"; // Import childApi to fetch children
import "./AIChat.css";

const AIChat = ({ isOpen, onClose, selectedChild: initialSelectedChild }) => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I'm BabyHaven AI, here to assist you on your parenting journey. How can I help you today?",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [childrenList, setChildrenList] = useState([]); // State for the list of children
  const [selectedChild, setSelectedChild] = useState(null); // State for the currently selected child in AIChat
  const chatContainerRef = useRef(null);

  // Fetch the list of children when the modal opens
  useEffect(() => {
    if (isOpen) {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) {
        console.error("No memberId found in localStorage");
        return;
      }

      childApi
        .getByMember(memberId)
        .then((response) => {
          if (response.data && response.data.data) {
            const list = response.data.data;
            setChildrenList(list);
            // Default to the first child in the list, or fall back to the initialSelectedChild
            if (list.length > 0) {
              setSelectedChild(list[0]);
            } else if (initialSelectedChild) {
              setSelectedChild(initialSelectedChild);
              setChildrenList([initialSelectedChild]); // Add the initial child to the list if no children are fetched
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching children:", error);
          // Fallback to initialSelectedChild if API fails
          if (initialSelectedChild) {
            setSelectedChild(initialSelectedChild);
            setChildrenList([initialSelectedChild]);
          }
        });
    }
  }, [isOpen, initialSelectedChild]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

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

  // Simulate sending message to backend
  const sendMessageToAI = async (message, child) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `I've analyzed the data for ${child?.name || "your child"}. Would you like to know more about nutrition or development?`
        );
      }, 1500);
    });
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset messages and chat state when modal closes
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
      setHasStartedChat(false);
      setChildrenList([]); // Reset children list
      setSelectedChild(null); // Reset selected child
    }
  }, [isOpen]);

  // Handle child selection
  const handleSelectChild = (child) => {
    setSelectedChild(child);
    // Optionally reset the chat when a new child is selected
    setMessages([
      {
        sender: "AI",
        text: `Hello! I'm BabyHaven AI, here to assist you with ${child.name}. How can I help you today?`,
      },
    ]);
    setHasStartedChat(false); // Reset chat state to show placeholder
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-flex">
          {/* Sidebar for Children List */}
          <div className="chat-sidebar">
            <h4 className="sidebar-title">Select a Child</h4>
            {childrenList.length > 0 ? (
              <ul className="children-list">
                {childrenList.map((child) => (
                  <li
                    key={child.name}
                    className={`child-item ${
                      selectedChild?.name === child.name ? "selected" : ""
                    }`}
                    onClick={() => handleSelectChild(child)}
                  >
                    <span className="child-name">{child.name}</span>
                    <span className="child-age">
                      {calculateAge(child.dateOfBirth)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-children">No children found.</p>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="chat-main">
            {/* Header */}
            <div className="chat-modal-header">
              <h3>Chat with BabyHaven AI {selectedChild ? `for ${selectedChild.name}` : ""}</h3>
              <button className="chat-modal-close" onClick={onClose}>
                ×
              </button>
            </div>

            {/* Main Content Area */}
            {hasStartedChat ? (
              <>
                {/* Chat Messages Area - Shown after the user sends a message */}
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

                {/* Input Area - At the bottom when chat has started */}
                <div className="chat-input-container">
                  <div className="chat-input-area">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="chat-input"
                    />
                    <button onClick={handleSendMessage} className="chat-send-btn">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-placeholder">
                <p>Type a message to start the conversation...</p>
                {/* Input Area - Centered when chat hasn't started */}
                <div className="chat-input-container centered">
                  <div className="chat-input-area">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="chat-input"
                    />
                    <button onClick={handleSendMessage} className="chat-send-btn">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate age (copied from ChildrenPage)
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "0 days";

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  const diffTime = Math.abs(today - birthDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) {
    return `${diffDays} days`;
  }

  if (years < 1) {
    return `${months} months`;
  }

  return `${years} years`;
};

export default AIChat;