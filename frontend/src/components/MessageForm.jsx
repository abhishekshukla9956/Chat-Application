import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function MessageForm({ receiver, onMessageSent }) {
  const { token, user } = useContext(AuthContext);
  const [text, setText] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/chat/messages/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sender: user.id, receiver: receiver.id, text }),
    });
    setText("");
    onMessageSent();
  };

  return (
    <form onSubmit={sendMessage}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default MessageForm;
