import React, { useState, useEffect } from "react";
import API from "../api";

export default function ProfilePage() {
  const [avatar, setAvatar] = useState("");
  const [preview, setPreview] = useState(null);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwTtoken");
  const BASE_URL = "https://focus-tracker-1-trs3.onrender.com";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.profile) {
          setAvatar(res.data.profile.avatar || "");
          setBio(res.data.profile.bio || "");
          setEmail(res.data.profile.email || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setAvatar(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar || typeof avatar === "string") return;
    const formData = new FormData();
    formData.append("avatar", avatar);
    try {
      setLoading(true);
      const res = await API.put("/api/auth/avatar", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvatar(res.data.avatar);
      setPreview(null);
      setLoading(false);
      alert("Profile picture updated!");
    } catch (err) {
      setLoading(false);
      console.error("Upload error:", err);
      alert("Failed to upload image");
    }
  };

  const handleBioUpdate = async () => {
    try {
      setLoading(true);
      await API.put("/api/auth/bio", { bio }, { headers: { Authorization: `Bearer ${token}` } });
      setLoading(false);
      alert("Bio updated!");
    } catch (err) {
      setLoading(false);
      console.error("Bio update error:", err);
      alert("Failed to update bio");
    }
  };

  const getAvatarURL = () => {
    if (preview) return preview;
    if (avatar) {
      const path = avatar.startsWith("/") ? avatar.slice(1) : avatar;
      return `${BASE_URL}${path}`;
    }
    return "https://via.placeholder.com/150";
  };

  return (
    <div className="d-flex justify-content-center align-items-start mt-5">
      <div
        className="card shadow-sm border-0 rounded-4 p-4"
        style={{ maxWidth: "900px", width: "100%" }}
      >
        <h3 className="text-center mb-4 fw-bold" style={{ fontSize: "1.5rem" }}>My Profile</h3>

        {/* Row layout with huge gap */}
        <div
          className="d-flex flex-row align-items-start justify-content-between"
          style={{ width: "100%" }}
        >
          {/* Avatar Column */}
          <div className="d-flex flex-column align-items-center" style={{ minWidth: "180px" }}>
            <div className="position-relative">
              <img
                src={getAvatarURL()}
                alt="Profile"
                crossOrigin="anonymous"
                className="shadow-sm"
                width="230"
                height="250"
                style={{ objectFit: "cover", borderRadius: "13px" }} // square shape
              />
              <label
                htmlFor="avatarUpload"
                className="btn btn-primary position-absolute bottom-0 end-0 shadow"
                style={{ transform: "translate(25%, -25%)", padding: "8px", fontSize: "1rem", cursor: "pointer" }}
              >
                <i className="bi bi-camera-fill"></i>
              </label>
              <input
                type="file"
                id="avatarUpload"
                className="d-none"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {preview && (
              <button
                onClick={handleAvatarUpload}
                disabled={loading}
                className="btn btn-primary mt-2 px-4 py-1"
                style={{ fontSize: "0.95rem" }}
              >
                {loading ? "Uploading..." : "Save Photo"}
              </button>
            )}
          </div>

          {/* Content Column */}
          <div className="flex-grow-1 ms-5">
            {/* Email */}
            <div className="mb-3" style={{ marginLeft: "100px" }}>
              <h6 className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>Email</h6>
              <p className="fw-semibold mb-0" style={{ fontSize: "0.95rem" }}>{email}</p>
            </div>

            {/* Bio */}
            <div style={{ marginLeft: "100px" }}>
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>About Me</label>
              <textarea
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  rows={5}
  className="mb-3"
  style={{
    border: "none",           // remove border
    outline: "none",          // remove outline
    boxShadow: "none",        // remove shadow
    borderRadius: "12px",     // optional rounded corners
    fontSize: "0.95rem",
    padding: "8px",
    backgroundColor: "#f8f9fa", // soft background
    width: "100%",
    resize: "none"             // disable resizing if needed
  }}
  placeholder="Write a short bio about yourself..."
/>

              <button
                onClick={handleBioUpdate}
                disabled={loading}
                className="btn btn-success w-100 py-1"
                style={{ fontSize: "0.9rem", fontWeight: "500" }}
              >
                {loading ? "Saving..." : "Save Bio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//BNMZMj9WTpZk1uLDXL5P6MM1
