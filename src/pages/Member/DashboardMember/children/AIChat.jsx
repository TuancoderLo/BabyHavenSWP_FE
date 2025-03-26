import React, { useState, useEffect, useRef } from "react";
import childApi from "../../../../services/childApi";
import Logo from "../../../../assets/full_logo.png";
import "./AIChat.css";

const AIChat = ({ isOpen, onClose, selectedChild: initialSelectedChild }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Debug newMessage
  useEffect(() => {
    console.log("newMessage:", newMessage);
  }, [newMessage]);

  // Fetch danh sách trẻ khi modal mở và tự động chọn trẻ đầu tiên
  useEffect(() => {
    if (isOpen) {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) {
        setError("No member ID found. Please log in again.");
        return;
      }

      setLoading(true);
      childApi
        .getByMember(memberId)
        .then((response) => {
          if (response.data && response.data.data) {
            const list = response.data.data;
            setChildrenList(list);
            if (list.length > 0) {
              const firstChild = list[0];
              setSelectedChild(firstChild);
              const storedMessages = localStorage.getItem(`chatMessages_${firstChild.name}`);
              setMessages(storedMessages ? JSON.parse(storedMessages) : []);
            } else if (initialSelectedChild) {
              setSelectedChild(initialSelectedChild);
              setChildrenList([initialSelectedChild]);
              const storedMessages = localStorage.getItem(`chatMessages_${initialSelectedChild.name}`);
              setMessages(storedMessages ? JSON.parse(storedMessages) : []);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching children:", error);
          setError("Failed to load children. Please try again later.");
          if (initialSelectedChild) {
            setSelectedChild(initialSelectedChild);
            setChildrenList([initialSelectedChild]);
            const storedMessages = localStorage.getItem(`chatMessages_${initialSelectedChild.name}`);
            setMessages(storedMessages ? JSON.parse(storedMessages) : []);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, initialSelectedChild]);

  // Lưu messages vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0 && selectedChild) {
      localStorage.setItem(`chatMessages_${selectedChild.name}`, JSON.stringify(messages));
    }
  }, [messages, selectedChild]);

  // Handle sending a message
  const handleSendMessage = async (text) => {
    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (!trimmedText) return;

    const userMessage = {
      sender: "User",
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const response = await sendMessageToAI(trimmedText, selectedChild);
      console.log("Response from sendMessageToAI:", response);
      const aiResponseText = typeof response === "string" ? response : "[Error: Invalid Response]";
      const aiMessage = {
        sender: "AI",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "AI",
        text: "Sorry, an error occurred. Please try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulate sending message to backend with specific responses for suggestions
  const sendMessageToAI = async (message, child) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (message === "Analyze growth record") {
          resolve(
            `Here is the growth analysis for ${child?.name || "your child"}: Based on the latest data, their height and weight are within the 75th percentile for their age. Would you like a detailed chart?`
          );
        } else if (message === "Health Consultation") {
          resolve(
            `For ${child?.name || "your child"}, I recommend scheduling a health checkup if they haven't had one recently. Common concerns at this age include nutrition and sleep patterns. Would you like tips on these topics?`
          );
        } else if (message === "Growth Advice") {
          resolve(
            `To support ${child?.name || "your child"}'s growth, ensure they have a balanced diet rich in protein, calcium, and vitamins. Regular physical activity is also key. Would you like a sample meal plan?`
          );
        } else {
          resolve(
            `I have analyzed the data for ${child?.name || "your child"}. Would you like to know more about nutrition or development?`
          );
        }
      }, 1500);
    });
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setNewMessage("");
      setIsTyping(false);
      setChildrenList([]);
      setSelectedChild(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  // Debug messages
  useEffect(() => {
    console.log("Messages:", messages);
  }, [messages]);

  // Handle child selection
  const handleSelectChild = (child) => {
    const storedMessages = localStorage.getItem(`chatMessages_${child.name}`);
    setMessages(storedMessages ? JSON.parse(storedMessages) : []);
    setSelectedChild(child);
  };

  // Handle suggestion button clicks
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  if (!isOpen) return null;

  const hasStartedChat = messages.length > 0;

  return (
    <div className="chat-modal-overlay-ai" onClick={onClose}>
      <div className="chat-modal-content-ai" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-flex-ai">
          {/* Sidebar for Children List */}
          <div className="chat-sidebar-ai" role="navigation" aria-label="Child selection">
            {loading ? (
              <div className="loading-spinner-ai">Loading...</div>
            ) : error ? (
              <p className="error-message-ai">{error}</p>
            ) : childrenList.length > 0 ? (
              <ul className="children-list-ai" role="listbox">
                {childrenList.map((child) => (
                  <li
                    key={child.name}
                    className={`child-item-ai ${
                      selectedChild?.name === child.name ? "selected-ai" : ""
                    }`}
                    onClick={() => handleSelectChild(child)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectChild(child)}
                    tabIndex={0}
                    role="option"
                    aria-selected={selectedChild?.name === child.name}
                  >
                    <div className="child-avatar-ai">
                      {child.avatar ? (
                        <img src={child.avatar} alt={`${child.name}'s avatar`} />
                      ) : (
                        <div className="avatar-placeholder-ai">
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="child-info-ai">
                      <span className="child-name-ai">{child.name}</span>
                      <span className="child-age-ai">{calculateAge(child.dateOfBirth)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-children-ai">No children found.</p>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="chat-main-ai">
            <div className="chat-main-header-ai">
                <img src={Logo} alt="logo" className="logo-ai" />
                <button className="chat-modal-close-ai" onClick={onClose}>
                ×
                </button>
            </div>
            {/* Messages Area */}
            <div className="chat-messages-ai" ref={chatContainerRef}>
              {hasStartedChat ? (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message-container-ai chat-message-ai ${
                        msg.sender === "User" ? "user-ai" : "ai-ai"
                      }`}
                    >
                      <div className="chat-text-wrapper-ai">
                        <div className="chat-text-ai">
                          {typeof msg.text === "string" ? msg.text : "[Invalid Message]"}
                        </div>
                        <div className="chat-timestamp-ai">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="chat-message-container-ai chat-message-ai ai-ai">
                    <div className="chat-avatar-ai"></div>
                      <div className="chat-text-wrapper-ai">
                        <div className="chat-text-ai typing-ai">
                          <span className="dot-ai"></span>
                          <span className="dot-ai"></span>
                          <span className="dot-ai"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="welcome-container-ai">
                  {selectedChild && (
                    <div className="welcome-title-wrapper-ai">
                      <h2 className="welcome-title-ai">
                        Hello! I am <span className="highlight">BabyHaven AI</span>, ready to assist you with {selectedChild.name}.
                      </h2>
                      <h2 className="welcome-title-ai below">
                        How can I help you today?
                      </h2>
                    </div>
                  )}
                  <div className="chat-input-and-suggestions-ai">
                    <div className="chat-input-container-ai">
                      <div className="chat-input-area-ai">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(String(e.target.value || ""))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              console.log("Sending message on Enter:", newMessage);
                              handleSendMessage(newMessage);
                            }
                          }}
                          placeholder="Type a message..."
                          className="chat-input-ai"
                        />
                        <button
                          onClick={() => {
                            console.log("Sending message on button click:", newMessage);
                            handleSendMessage(newMessage);
                          }}
                          className="chat-send-btn-ai"
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                    <div className="suggestion-buttons-ai">
                      <button
                        className="suggestion-btn-ai"
                        onClick={() => handleSuggestionClick("Analyze growth record")}
                      >
                        Analyze growth record
                      </button>
                      <button
                        className="suggestion-btn-ai"
                        onClick={() => handleSuggestionClick("Health Consultation")}
                      >
                        Health Consultation
                      </button>
                      <button
                        className="suggestion-btn-ai"
                        onClick={() => handleSuggestionClick("Growth Advice")}
                      >
                        Growth Advice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area (when chat has started) */}
            {hasStartedChat && (
              <div className="chat-input-container-ai">
                <div className="chat-input-area-ai">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(String(e.target.value || ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        console.log("Sending message on Enter:", newMessage);
                        handleSendMessage(newMessage);
                      }
                    }}
                    placeholder="Type a message..."
                    className="chat-input-ai"
                  />
                  <button
                    onClick={() => {
                      console.log("Sending message on button click:", newMessage);
                      handleSendMessage(newMessage);
                    }}
                    className="chat-send-btn-ai"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate age
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