import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Invalid email or password."
      );
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-logo">
          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
          />
        </div>

        <h1>AJA BAKES</h1>

        <p className="admin-login-subtitle">
          Admin Login
        </p>

        <form onSubmit={handleLogin}>

          <div className="admin-input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>


          <div className="admin-input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>


          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}


          <button
            type="submit"
            className="admin-login-btn"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}