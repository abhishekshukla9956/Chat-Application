import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function UserList({ onSelectUser }) {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selfProfile, setSelfProfile] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // khud ko user list me se hata diya
          setUsers(data.filter((u) => u.id !== user?.user_id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchProfileSelf = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSelfProfile(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
    fetchProfileSelf();
  }, [token, user?.user_id]);

  const handleSelect = (u) => {
    setSelectedUserId(u.id);
    onSelectUser(u);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: "15px",
        borderRight: "1px solid #444",
        overflowY: "auto",
      }}
    >
      {/* 🔹 Self Profile Section */}
      {selfProfile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "#2c2c2c",
          }}
        >
          <img
            src={selfProfile.profile_pic || "/default-dp.png"}
            alt="dp"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              marginRight: "10px",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold" }}>
              {selfProfile.username || user?.username}
            </div>
            <button
              onClick={() => (window.location.href = "/profile")}
              style={{
                marginTop: "5px",
                background: "#4CAF50",
                border: "none",
                borderRadius: "4px",
                padding: "3px 6px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#fff",
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: "15px" }}>Users</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users.length > 0 ? (
          users.map((u) => {
            const isSelected = String(selectedUserId) === String(u.id);
            return (
              <div
                key={u.id}
                onClick={() => handleSelect(u)}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "6px",
                  backgroundColor: isSelected ? "#fff" : "#2c2c2c",
                  color: isSelected ? "#000" : "#fff",
                  transition: "0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={u.profile?.profile_pic || "/default-dp.png"}
                  alt="dp"
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <span>{u.username}</span>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: "14px", color: "#aaa" }}>No users found</p>
        )}
      </div>
    </div>
  );
}
