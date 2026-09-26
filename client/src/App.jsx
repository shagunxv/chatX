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
  const [showPeople, setShowPeople] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage
      ]);
    });

    socket.on("users_update", (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("users_update");
    };
  }, []);

  const joinChat = () => {
    if (username.trim() === "") return;

    const cleanUsername = username.trim();

    setUsername(cleanUsername);
    setJoined(true);

    // Tell server that user joined
    socket.emit("join_chat", cleanUsername);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("send_message", {
      username: username,
      text: message,
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
    );
  }

  return (
    <div className="app">

      <div className="chat-container">

        {/* HEADER */}
        <header className="header">

          <h1>ChatX 💬</h1>

          <div className="header-right">

            <span className={connected ? "online" : "offline"}>
              ● {connected ? "Connected" : "Connecting..."}
            </span>

            <button
              className="people-button"
              onClick={() => setShowPeople(!showPeople)}
            >
              👥 {users.length}
            </button>

          </div>

        </header>

        {/* PEOPLE PANEL */}
        {showPeople && (
          <div className="people-panel">

            <div className="people-title">
              👥 People in Chat
            </div>

            {users.length === 0 ? (
              <p>No one is online</p>
            ) : (
              users.map((user, index) => (
                <div className="person" key={index}>

                  <span className="person-status">
                    🟢
                  </span>

                  <span>
                    {user}
                    {user === username && " (You)"}
                  </span>

                </div>
              ))
            )}

          </div>
        )}

        {/* WELCOME */}
        <div className="welcome">
          Welcome, <strong>{username}</strong> 👋
        </div>

        {/* MESSAGES */}
        <div className="messages">

          {messages.length === 0 ? (

            <div className="empty-chat">

              <div>💬</div>

              <h2>No messages yet</h2>

              <p>Start the conversation!</p>

            </div>

          ) : (

            messages.map((msg, index) => (

              <div
                className={
                  msg.username === username
                    ? "message my-message"
                    : "message"
                }
                key={index}
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

        {/* INPUT */}
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