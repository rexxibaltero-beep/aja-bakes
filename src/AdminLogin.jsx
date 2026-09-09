
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";
import "./AdminLogin.css";

const ADMIN_EMAILS = [
  "bsentrep.davism@gmail.com",
  "darrabaltero@gmail.com",
  // Add Mikay's email here if you want
  // "mikay@email.com",
];

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // EMAIL + PASSWORD LOGIN
  // =========================================

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = result.user;

      console.log("Email login:", user.email);

      // Check if email is an authorized admin
      const isAdmin = ADMIN_EMAILS.includes(
        user.email?.toLowerCase()
      );

      if (!isAdmin) {
        await signOut(auth);

        setError(
          "Access denied. This account is not authorized as an admin."
        );

        return;
      }

      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Email login error:", error);

      if (error.code === "auth/invalid-credential") {
        setError(
          "Invalid email or password. Please check your credentials."
        );
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "Too many login attempts. Please wait a while and try again."
        );
      } else if (error.code === "auth/user-not-found") {
        setError(
          "No admin account was found with this email."
        );
      } else if (error.code === "auth/wrong-password") {
        setError(
          "Incorrect password. Please try again."
        );
      } else if (error.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else {
        setError(
          "Unable to login. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;

      console.log("Google login:", user.email);

      // Check authorized admin email
      const isAdmin = ADMIN_EMAILS.includes(
        user.email?.toLowerCase()
      );

      if (!isAdmin) {
        await signOut(auth);

        setError(
          "Access denied. This Google account is not authorized as an admin."
        );

        return;
      }

      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Google login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setError("Google login was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "Google login was blocked. Please allow pop-ups."
        );
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "Too many login attempts. Please wait a while and try again."
        );
      } else if (error.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else {
        setError(
          "Unable to login with Google. Please try again."
        );
      }

    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* LOGO */}
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

        {/* =====================================
            EMAIL + PASSWORD
        ===================================== */}

        <form onSubmit={handleEmailLogin}>

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
              disabled={loading || googleLoading}
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
              disabled={loading || googleLoading}
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || googleLoading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* =====================================
            DIVIDER
        ===================================== */}

        <div className="admin-login-divider">
          <span>OR</span>
        </div>

        {/* =====================================
            GOOGLE LOGIN
        ===================================== */}

        <button
          type="button"
          className="admin-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          <span className="admin-google-icon">
            G
          </span>

          <span>
            {googleLoading
              ? "Signing in..."
              : "Continue with Google"}
          </span>
        </button>

        {/* ERROR */}
        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}

        <p className="admin-login-note">
          Authorized administrators only.
        </p>

      </div>

    </div>
  );
}
