import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function Profile() {
  const { token, user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState(user?.username || "");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch profile on load
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || "");
          setProfilePic(data.profile_pic || null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  // 🔹 Update profile
  async function updateProfile() {
    const formData = new FormData();
    if (file) formData.append("profile_pic", file);
    if (username.trim()) formData.append("username", username);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/profile/", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        alert("Profile updated!");
        setProfilePic(data.profile_pic); // ✅ refresh image instantly
        navigate("/"); // redirect
      } else {
        console.error("Update failed:", await res.text());
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Update Profile</h2>

      {/* 🔹 Show current or preview profile picture */}
      <div style={{ marginBottom: "15px" }}>
        <img
          src={file ? URL.createObjectURL(file) : profilePic || "/default.png"}
          alt="Profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Change Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button onClick={updateProfile}>Save</button>
    </div>
  );
}
