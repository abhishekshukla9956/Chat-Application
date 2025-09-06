import React, { useState } from "react";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import "../styles/ChatPage.css";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-container">
      <div className="user-list">
        <UserList onSelectUser={setSelectedUser} />
      </div>

      <div className="chat-window">
        {selectedUser ? (
          <ChatWindow
            otherUserId={selectedUser.id}
            otherUsername={selectedUser.username}
          />
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}
