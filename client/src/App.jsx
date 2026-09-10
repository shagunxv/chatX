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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
    };
  }, []);

  const joinChat = () => {
    const name = username.trim();

    if (!name) return;

    setUsername(name);
    setJoined(true);
  };

  const sendMessage = () => {
    const text = message.trim();

    if (!text) return;

    socket.emit("send_message", {
      username: username,
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setMessage("");
  };

  /* ================= LOGIN SCREEN ================= */

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

            <div className="join-content">

              <div className="welcome-icon">
                💬
              </div>

              <h2>Welcome to ChatX 👋</h2>

              <p>
                Enter your name to join the conversation
              </p>

              <div className="join-form">

                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinChat();
                    }
                  }}
                />

                <button onClick={joinChat}>
                  Join Chat 🚀
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ================= CHAT SCREEN ================= */

  return (
    <div className="app">

      <div className="chat-container">

        <header className="header">

          <h1>ChatX 💬</h1>

          <span className={connected ? "online" : "offline"}>
            ● {connected ? "Connected" : "Connecting..."}
          </span>

        </header>

        <div className="welcome">
          Welcome, <strong>{username}</strong> 👋
        </div>

        <div className="messages">

          {messages.length === 0 ? (

            <div className="empty-chat">

              <div className="empty-icon">
                💬
              </div>

              <h2>No messages yet</h2>

              <p>Start the conversation!</p>

            </div>

          ) : (

            messages.map((msg, index) => (

              <div
                key={index}
                className={
                  msg.username === username
                    ? "message my-message"
                    : "message"
                }
              >

                <div className="message-user">
                  {msg.username}
                </div>

                <div className="message-text">
                  {msg.text}
                </div>

                <div className="message-time">
                  {msg.time}
                </div>

              </div>

            ))

          )}

        </div>

        <div className="input-area">

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            Send 🚀
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;