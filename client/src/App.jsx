
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://chatx-a9jh.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const onUsersUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("users_update", onUsersUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("users_update", onUsersUpdate);
    };
  }, []);

  const joinChat = () => {
    const cleanUsername = username.trim();
    if (!cleanUsername || !connected) return;

    setUsername(cleanUsername);
    setJoined(true);
    socket.emit("join_chat", cleanUsername);
  };

  const sendMessage = () => {
    if (!message.trim() || !connected) return;

    socket.emit("send_message", {
      username,
      text: message.trim(),
    });

    setMessage("");
  };

  if (!joined) {
    return (
      <div className="app">
        <div className="chat-container">
          <header className="header">
            <h1>ChatX 💬</h1>
            <span className={connected ? "online" : "offline"}>
              ● {connected ? "Connected" : "Connecting..."}
            </span>
          </header>

          <div className="join-screen">
            <h2>Welcome to ChatX 👋</h2>
            <p>Enter your name to join the conversation</p>

            <div className="join-form">
              <input
                type="text"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") joinChat();
                }}
              />
              <button onClick={joinChat} disabled={!connected}>
                Join Chat 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-container chat-layout">
        <header className="header">
          <h1>ChatX 💬</h1>

          <div className="header-right">
            <span className={connected ? "online" : "offline"}>
              ● {connected ? "Connected" : "Disconnected"}
            </span>

            <span className="people-count">
              👥 {users.length}
            </span>
          </div>
        </header>

        <div className="chat-body">
          {/* PARTICIPANTS SIDEBAR */}
          <aside className="users-sidebar">
            <div className="sidebar-heading">
              <h2>Participants</h2>
              <span>{users.length} online</span>
            </div>

            <div className="users-list">
              {users.length === 0 ? (
                <p className="no-users">Waiting for participants...</p>
              ) : (
                users.map((user, index) => {
                  const name =
                    typeof user === "string" ? user : user.username;

                  if (!name) return null;

                  return (
                    <div className="person" key={`${name}-${index}`}>
                      <div className="person-avatar">
                        {name.charAt(0).toUpperCase()}
                        <span className="status-dot" />
                      </div>

                      <div className="person-details">
                        <span className="person-name">{name}</span>
                        <span className="person-status">
                          <span className="online-dot" />
                          {name === username ? "You · Online" : "Online"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="sidebar-footer">
              <span className="online-dot" />
              Live participants
            </div>
          </aside>

          {/* CONVERSATION AREA */}
          <section className="conversation">
            <div className="welcome">
              <div>
                <strong>Chat room</strong>
                <span>Welcome, {username} 👋</span>
              </div>
            </div>

            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-chat-icon">💬</div>
                  <h2>Your conversation starts here</h2>
                  <p>Send a message to get things going.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    className={
                      msg.username === username
                        ? "message my-message"
                        : "message"
                    }
                    key={`${msg.username}-${msg.time}-${index}`}
                  >
                    <div className="message-user">{msg.username}</div>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                ))
              )}
            </div>

            <div className="input-area">
              <input
                type="text"
                placeholder={
                  connected ? "Write a message..." : "Reconnecting..."
                }
                value={message}
                disabled={!connected}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!connected || !message.trim()}
              >
                Send 🚀
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
