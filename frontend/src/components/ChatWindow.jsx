import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";

export default function ChatWindow({ otherUserId, otherUsername }) {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // edit ke liye state
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState("");

  // file upload ke liye
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!otherUserId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedMsgId !== null) {
        setSelectedMsgId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedMsgId]);

  // Fetch Messages
  async function fetchMessages() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/messages/?user_id=${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  // Send Message
  async function sendMessage() {
    if (!newMessage.trim() && !file) return;

    const formData = new FormData();
    formData.append("receiver", otherUserId);

    if (newMessage.trim()) {
      formData.append("text", newMessage);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/messages/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]); // ✅ instant update
        setNewMessage("");
        setFile(null);
        setShowFileOptions(false);
      } else {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  // Delete Message
  async function deleteMessage(id) {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/messages/${id}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        setSelectedMsgId(null);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  }

  // Edit
  function startEdit(msg) {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  }

  async function saveEdit() {
    if (!editText.trim()) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/messages/${editingMsgId}/edit/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editText }),
        }
      );

      if (!res.ok) throw new Error("Failed to edit message");

      const updatedMsg = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMsgId ? updatedMsg : m))
      );
      setEditingMsgId(null);
      setEditText("");
    } catch (err) {
      console.error("Error editing message:", err);
    }
  }

  // Download with Auth
  async function downloadWithAuth(url, token, filename = "file") {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }, // ✅ fixed
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e1e",
        color: "#fff",
      }}
    >
      <h3 style={{ margin: 0, padding: "10px", background: "#333" }}>
        Chat with {otherUsername}
      </h3>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          border: "1px solid #444",
          margin: "10px 0",
          padding: "10px",
          background: "#121212",
        }}
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const senderId =
              msg.sender?.id !== undefined ? msg.sender.id : msg.sender;
            const isOwn = Number(senderId) === Number(user?.id);

            return (
              <div
                key={msg.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isOwn) setSelectedMsgId(msg.id);
                }}
                style={{
                  textAlign: isOwn ? "right" : "left",
                  margin: "8px 0",
                }}
              >
                {editingMsgId === msg.id ? (
                  // Edit mode
                  <div>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        padding: "5px",
                        borderRadius: "5px",
                        width: "70%",
                        backgroundColor: "black",
                        color: "white",
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      style={{
                        marginRight: "5px",
                        marginLeft: "10px",
                        background: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "3px 7px",
                        cursor: "pointer",
                      }}
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingMsgId(null)}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "3px 7px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // Normal message
                  <span
                    style={{
                      display: "inline-block",
                      padding: msg.file_url ? "0" : "8px 12px", // ✅ no bg for files
                      borderRadius: "12px",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                      backgroundColor: msg.file_url
                        ? "transparent"
                        : isOwn
                        ? "#4CAF50"
                        : "#2E86C1",
                      color: "#fff",
                    }}
                  >
                    {msg.text && <div>{msg.text}</div>}

                    {msg.file_url && (
                      <div style={{ marginTop: msg.text ? 6 : 0 }}>
                        {msg.file_url.endsWith(".pdf") ? (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#fff",
                              background: "#2E86C1",
                              padding: "6px 10px",
                              borderRadius: 6,
                              textDecoration: "none",
                              display: "inline-block",
                            }}
                          >
                            PDF
                          </a>
                        ) : (
                          <img
                            src={msg.file_url}
                            alt="attachment"
                            style={{
                              maxWidth: "200px",
                              borderRadius: "8px",
                              height: "auto",
                              display: "block",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
                            }}
                          />
                        )}

                        {/* Download Button */}
                        {!isOwn && msg.download_url && (
                          <button
                            onClick={() =>
                              downloadWithAuth(
                                msg.download_url,
                                token,
                                msg.file?.split("/").pop() || "file"
                              )
                            }
                            style={{
                              marginTop: "5px",
                              color: "#fff",
                              background: "#444",
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    )}
                  </span>
                )}

                {/* Right-click -> Edit/Delete */}
                {isOwn &&
                  selectedMsgId === msg.id &&
                  editingMsgId !== msg.id && (
                    <div style={{ marginTop: "5px" }}>
                      <button
                        onClick={() => startEdit(msg)}
                        style={{
                          marginRight: "5px",
                          background: "#FFA500",
                          border: "none",
                          borderRadius: "5px",
                          padding: "3px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        style={{
                          background: "#FF4444",
                          border: "none",
                          borderRadius: "5px",
                          padding: "3px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
              </div>
            );
          })
        )}
      </div>

      {/* Input + Send + File Upload */}
      <div
        style={{ display: "flex", paddingTop: "10px", alignItems: "center" }}
      >
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowFileOptions(!showFileOptions)}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#2E86C1",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            +
          </button>
          {showFileOptions && (
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                left: 0,
                background: "#333",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <label style={{ display: "block", cursor: "pointer" }}>
                Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <label style={{ display: "block", cursor: "pointer" }}>
                PDF
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #444",
            color: "black",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
