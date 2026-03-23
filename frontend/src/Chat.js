import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000";

function ChatUI() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [socket, setSocket]           = useState(null);
  const [conversations, setConversations] = useState([
    { id: "conv1", name: "Priya Rao",      role: "Freelancer", lastMsg: "Sure, I can start Monday!",   time: "2m",  unread: 2, online: true  },
    { id: "conv2", name: "TechCorp Client", role: "Client",     lastMsg: "Please review the milestone", time: "1h",  unread: 0, online: true  },
    { id: "conv3", name: "Siddharth M.",   role: "Freelancer", lastMsg: "Sent you the Figma link",     time: "3h",  unread: 1, online: false },
    { id: "conv4", name: "Anika Nair",     role: "Freelancer", lastMsg: "Payment received, thanks!",   time: "1d",  unread: 0, online: false },
  ]);
  const [activeConv, setActiveConv]   = useState(conversations[0]);
  const [messages, setMessages]       = useState({
    conv1: [
      { id: 1, senderId: "other", text: "Hey! I saw your project post.",           time: "10:30 AM" },
      { id: 2, senderId: user?.id, text: "Hi Priya! Yes, are you interested?",     time: "10:31 AM" },
      { id: 3, senderId: "other", text: "Absolutely, I have 3 years of experience in React.", time: "10:32 AM" },
      { id: 4, senderId: user?.id, text: "Great! When can you start?",             time: "10:33 AM" },
      { id: 5, senderId: "other", text: "Sure, I can start Monday!",               time: "10:35 AM" },
    ],
    conv2: [
      { id: 1, senderId: "other", text: "Hello, we need a full-stack developer.",  time: "9:00 AM" },
      { id: 2, senderId: user?.id, text: "I'd be happy to help. What's the scope?", time: "9:05 AM" },
      { id: 3, senderId: "other", text: "Please review the milestone",             time: "9:10 AM" },
    ],
    conv3: [
      { id: 1, senderId: "other", text: "Sent you the Figma link",                time: "Yesterday" },
    ],
    conv4: [
      { id: 1, senderId: "other", text: "Payment received, thanks!",              time: "Yesterday" },
    ],
  });
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [connected, setConnected]     = useState(false);
  const [search, setSearch]           = useState("");
  const [showAttach, setShowAttach]   = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── SOCKET SETUP ──
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join", { userId: user?.id });
    });

    newSocket.on("disconnect", () => setConnected(false));

    // Receive message
    newSocket.on("receive_message", (data) => {
      setMessages((prev) => ({
        ...prev,
        [data.conversationId]: [
          ...(prev[data.conversationId] || []),
          {
            id: Date.now(),
            senderId: data.senderId,
            text: data.text,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
      // Update last message in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMsg: data.text, time: "now", unread: c.unread + 1 }
            : c
        )
      );
    });

    // Typing indicator
    newSocket.on("typing", (data) => {
      if (data.conversationId === activeConv?.id) setIsTyping(true);
    });
    newSocket.on("stop_typing", (data) => {
      if (data.conversationId === activeConv?.id) setIsTyping(false);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ── SCROLL TO BOTTOM ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConv]);

  // ── CLEAR UNREAD ON OPEN ──
  useEffect(() => {
    if (activeConv) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, unread: 0 } : c))
      );
      inputRef.current?.focus();
    }
  }, [activeConv]);

  // ── SEND MESSAGE ──
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: user?.id,
      text: input.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    // Add locally
    setMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), newMsg],
    }));

    // Update sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id ? { ...c, lastMsg: input.trim(), time: "now" } : c
      )
    );

    // Emit to socket
    socket?.emit("send_message", {
      conversationId: activeConv.id,
      senderId: user?.id,
      receiverId: activeConv.id,
      text: input.trim(),
    });

    // Stop typing
    socket?.emit("stop_typing", { conversationId: activeConv.id, userId: user?.id });

    setInput("");
    setShowAttach(false);
  };

  // ── TYPING INDICATOR ──
  const handleInputChange = (e) => {
    setInput(e.target.value);

    socket?.emit("typing", { conversationId: activeConv.id, userId: user?.id });

    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => {
      socket?.emit("stop_typing", { conversationId: activeConv.id, userId: user?.id });
    }, 1500);
    setTypingTimeout(t);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    "linear-gradient(135deg,#6C63FF,#FF6584)",
    "linear-gradient(135deg,#43E8A0,#6C63FF)",
    "linear-gradient(135deg,#FF6584,#F6AD55)",
    "linear-gradient(135deg,#F6AD55,#43E8A0)",
  ];

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentMsgs = messages[activeConv?.id] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-shell {
          display: flex;
          height: 100vh;
          background: #0A0B0F;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── SIDEBAR ── */
        .chat-sidebar {
          width: 300px;
          min-width: 300px;
          background: #13151C;
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
        }
        .chat-sidebar-header {
          padding: 20px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .chat-sidebar-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .search-input {
          width: 100%;
          padding: 9px 14px 9px 36px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input::placeholder { color: #5A5E72; }
        .search-input:focus { border-color: rgba(108,99,255,0.45); }

        .conv-list { flex: 1; overflow-y: auto; padding: 8px 0; }
        .conv-list::-webkit-scrollbar { width: 3px; }
        .conv-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .conv-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 18px;
          cursor: pointer;
          transition: background 0.12s;
          position: relative;
        }
        .conv-item:hover { background: rgba(255,255,255,0.03); }
        .conv-item.active { background: rgba(108,99,255,0.08); }
        .conv-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 6px; bottom: 6px;
          width: 3px;
          background: #6C63FF;
          border-radius: 0 2px 2px 0;
        }

        .conv-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          color: #fff; flex-shrink: 0;
          font-family: 'Syne', sans-serif;
          position: relative;
        }
        .online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #43E8A0;
          border: 2px solid #13151C;
        }

        .conv-info { flex: 1; min-width: 0; }
        .conv-name { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-last { font-size: 12px; color: #5A5E72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
        .conv-time { font-size: 11px; color: #5A5E72; }
        .unread-badge {
          background: #6C63FF; color: #fff;
          border-radius: 10px; padding: 1px 6px;
          font-size: 10px; font-weight: 700;
          min-width: 18px; text-align: center;
        }

        /* ── MAIN CHAT ── */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #0A0B0F;
          overflow: hidden;
        }

        .chat-header {
          padding: 14px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0A0B0F;
          flex-shrink: 0;
        }
        .chat-header-left { display: flex; align-items: center; gap: 12px; }
        .chat-header-actions { display: flex; align-items: center; gap: 8px; }

        .icon-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #8B8FA8;
          transition: all 0.15s;
        }
        .icon-btn:hover { background: #20232F; color: #F0F2FF; }

        /* ── MESSAGES ── */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 2px;
        }
        .msg-row.mine { flex-direction: row-reverse; }

        .msg-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff;
          flex-shrink: 0; align-self: flex-end;
          font-family: 'Syne', sans-serif;
        }

        .msg-bubble {
          max-width: 65%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
        }
        .msg-bubble.theirs {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          color: #F0F2FF;
          border-bottom-left-radius: 4px;
        }
        .msg-bubble.mine {
          background: #6C63FF;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .msg-time {
          font-size: 10px;
          color: #5A5E72;
          margin-top: 4px;
          padding: 0 4px;
        }
        .msg-row.mine .msg-time { text-align: right; }

        .date-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 14px 0 10px;
        }
        .date-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .date-divider-text { font-size: 11px; color: #5A5E72; white-space: nowrap; }

        .typing-indicator {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 0 10px;
          font-size: 12px; color: #8B8FA8;
          font-style: italic;
        }
        .typing-dots { display: flex; gap: 3px; }
        .typing-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #8B8FA8;
          animation: typingBounce 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* ── INPUT BAR ── */
        .input-bar {
          padding: 14px 22px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: #0A0B0F;
          flex-shrink: 0;
        }
        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: #13151C;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 8px 12px;
          transition: border-color 0.15s;
        }
        .input-row:focus-within { border-color: rgba(108,99,255,0.45); }

        .chat-textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          resize: none;
          max-height: 120px;
          min-height: 22px;
          line-height: 1.5;
          padding: 4px 0;
        }
        .chat-textarea::placeholder { color: #5A5E72; }

        .send-btn {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: #6C63FF;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover { background: #7B74FF; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .attach-row {
          display: flex;
          gap: 8px;
          padding: 8px 4px 2px;
          animation: fadeUp 0.15s ease;
        }
        .attach-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 12px; color: #8B8FA8;
          cursor: pointer;
          transition: all 0.15s;
        }
        .attach-chip:hover { background: #20232F; color: #F0F2FF; border-color: rgba(255,255,255,0.14); }

        .connected-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px;
          padding: 3px 9px; border-radius: 20px;
        }
        .connected-pill.on  { background: rgba(67,232,160,0.1);  color: #43E8A0; }
        .connected-pill.off { background: rgba(255,101,132,0.1); color: #FF6584; }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-anim { animation: msgIn 0.18s ease forwards; }
      `}</style>

      <div className="chat-shell">

        {/* ── SIDEBAR ── */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title">
              <span>Messages</span>
              <div className={`connected-pill ${connected ? "on" : "off"}`}>
                <div className="pill-dot" />
                {connected ? "Live" : "Offline"}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}
                width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#F0F2FF" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="#F0F2FF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="conv-list">
            {filteredConvs.map((conv, i) => (
              <div
                key={conv.id}
                className={`conv-item ${activeConv?.id === conv.id ? "active" : ""}`}
                onClick={() => setActiveConv(conv)}
              >
                <div className="conv-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                  {getInitials(conv.name)}
                  {conv.online && <div className="online-dot" />}
                </div>
                <div className="conv-info">
                  <div className="conv-name">{conv.name}</div>
                  <div className="conv-last">{conv.lastMsg}</div>
                </div>
                <div className="conv-meta">
                  <span className="conv-time">{conv.time}</span>
                  {conv.unread > 0 && (
                    <span className="unread-badge">{conv.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CHAT ── */}
        <div className="chat-main">

          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: avatarColors[conversations.findIndex(c => c.id === activeConv?.id) % avatarColors.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif",
                position: "relative", flexShrink: 0,
              }}>
                {getInitials(activeConv?.name)}
                {activeConv?.online && (
                  <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 9, height: 9, borderRadius: "50%",
                    background: "#43E8A0", border: "2px solid #0A0B0F",
                  }} />
                )}
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>
                  {activeConv?.name}
                </div>
                <div style={{ fontSize: 12, color: activeConv?.online ? "#43E8A0" : "#5A5E72" }}>
                  {activeConv?.online ? "Online now" : "Offline"} · {activeConv?.role}
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              {/* Video call button */}
              <div className="icon-btn" title="Video Call">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="4" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </div>
              {/* Info button */}
              <div className="icon-btn" title="Info">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            <div className="date-divider">
              <div className="date-divider-line" />
              <span className="date-divider-text">Today</span>
              <div className="date-divider-line" />
            </div>

            {currentMsgs.map((msg, i) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`msg-row ${isMine ? "mine" : ""} msg-anim`}>
                  {!isMine && (
                    <div className="msg-avatar" style={{
                      background: avatarColors[conversations.findIndex(c => c.id === activeConv?.id) % avatarColors.length],
                      width: 28, height: 28,
                    }}>
                      {getInitials(activeConv?.name)}
                    </div>
                  )}
                  <div>
                    <div className={`msg-bubble ${isMine ? "mine" : "theirs"}`}>
                      {msg.text}
                    </div>
                    <div className="msg-time">{msg.time}</div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                {activeConv?.name} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="input-bar">
            {/* Attachment options */}
            {showAttach && (
              <div className="attach-row">
                {[
                  { label: "File",  icon: "📎" },
                  { label: "Image", icon: "🖼️" },
                  { label: "Proposal", icon: "📋" },
                ].map((a) => (
                  <div key={a.label} className="attach-chip">
                    <span style={{ fontSize: 13 }}>{a.icon}</span>
                    {a.label}
                  </div>
                ))}
              </div>
            )}

            <div className="input-row">
              {/* Attach toggle */}
              <button
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: showAttach ? "#6C63FF" : "#5A5E72",
                  padding: "4px", display: "flex", alignItems: "center",
                  transition: "color 0.15s", flexShrink: 0,
                }}
                onClick={() => setShowAttach(!showAttach)}
                title="Attach file"
              >
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 7.5l-6 6a4 4 0 01-5.657-5.657l6.364-6.364a2.5 2.5 0 013.535 3.535L5.379 11.38a1 1 0 01-1.414-1.414L9.5 4.5"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                className="chat-textarea"
                placeholder={`Message ${activeConv?.name}...`}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />

              {/* Send */}
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L1 7l5 2 2 5 6-12z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: 11, color: "#5A5E72", marginTop: 7, paddingLeft: 4 }}>
              Press <kbd style={{ background: "#1A1D27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Enter</kbd> to send ·
              <kbd style={{ background: "#1A1D27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px", fontSize: 10, marginLeft: 4 }}>Shift+Enter</kbd> for new line
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatUI;