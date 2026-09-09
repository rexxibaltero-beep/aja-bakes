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

// =========================================
// AUTHORIZED ADMIN EMAILS
// =========================================

const ADMIN_EMAILS = [
  "bsentrep.davism@gmail.com",
  "darrabaltero@gmail.com",

  // Add Mikay's email here when available
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
      console.log("🔥 ADMIN EMAIL LOGIN START");

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = result.user;

      console.log("🔥 Admin email login successful");
      console.log("🔥 Admin email:", user.email);
      console.log("🔥 Admin UID:", user.uid);

      // =========================================
      // CHECK ADMIN EMAIL
      // =========================================

      const isAdmin = ADMIN_EMAILS.includes(
        user.email?.toLowerCase()
      );

      console.log("🔥 Is authorized admin:", isAdmin);

      if (!isAdmin) {
        await signOut(auth);

        setError(
          "Access denied. This account is not authorized as an admin."
        );

        return;
      }

      console.log("🔥 ADMIN LOGIN SUCCESS!");

      navigate("/admin/dashboard");

    } catch (error) {
      console.error("🔥 ADMIN EMAIL LOGIN ERROR:", error);
      console.error("🔥 ERROR CODE:", error.code);
      console.error("🔥 ERROR MESSAGE:", error.message);

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
          `Unable to login: ${error.code || "Unknown error"}`
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GOOGLE ADMIN LOGIN
  // =========================================

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      console.log("🔥 ADMIN GOOGLE LOGIN START");

      // =========================================
      // CLEAR EXISTING FIREBASE SESSION
      // =========================================
      // This prevents an existing Customer session
      // from interfering with Admin Google login.
      //
      // NOTE:
      // Admin and Customer currently share the same
      // Firebase Auth instance. We will separate
      // these sessions later.
      // =========================================

      try {
        await signOut(auth);
        console.log("🔥 Existing auth session cleared");
      } catch (signOutError) {
        console.log(
          "⚠️ No existing auth session to clear."
        );
      }

      // =========================================
      // GOOGLE PROVIDER
      // =========================================

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("🔥 Opening Admin Google popup...");

      // =========================================
      // GOOGLE POPUP
      // =========================================

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(
        "🔥 Admin Google popup completed!"
      );

      console.log(
        "🔥 Google result:",
        result
      );

      const user = result.user;

      console.log(
        "🔥 Admin Google user:",
        user
      );

      console.log(
        "🔥 Admin email:",
        user.email
      );

      console.log(
        "🔥 Admin UID:",
        user.uid
      );

      // =========================================
      // CHECK AUTHORIZED ADMIN
      // =========================================

      const isAdmin = ADMIN_EMAILS.includes(
        user.email?.toLowerCase()
      );

      console.log(
        "🔥 Is authorized admin:",
        isAdmin
      );

      // =========================================
      // NOT AN ADMIN
      // =========================================

      if (!isAdmin) {
        console.log(
          "❌ Google account is NOT authorized."
        );

        await signOut(auth);

        setError(
          "Access denied. This Google account is not authorized as an admin."
        );

        return;
      }

      // =========================================
      // SUCCESS
      // =========================================

      console.log(
        "🔥 ADMIN GOOGLE LOGIN SUCCESS!"
      );

      console.log(
        "🔥 Navigating to /admin/dashboard..."
      );

      navigate("/admin/dashboard");

    } catch (error) {
      console.error(
        "🔥 ADMIN GOOGLE LOGIN ERROR:",
        error
      );

      console.error(
        "🔥 ERROR CODE:",
        error.code
      );

      console.error(
        "🔥 ERROR MESSAGE:",
        error.message
      );

      // =========================================
      // ERROR HANDLING
      // =========================================

      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google login popup was closed. Please try again."
        );

      } else if (
        error.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Google login popup was blocked. Please allow pop-ups."
        );

      } else if (
        error.code ===
        "auth/cancelled-popup-request"
      ) {
        setError(
          "Another Google login window is already open. Please try again."
        );

      } else if (
        error.code ===
        "auth/unauthorized-domain"
      ) {
        setError(
          "This website is not authorized for Google Login."
        );

      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {
        setError(
          "Network error. Please check your internet connection."
        );

      } else if (
        error.code ===
        "auth/operation-not-allowed"
      ) {
        setError(
          "Google Sign-In is not enabled in Firebase Authentication."
        );

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many login attempts. Please wait a while and try again."
        );

      } else {
        setError(
          `Google login failed: ${
            error.code || "Unknown error"
          }`
        );
      }

    } finally {
      setGoogleLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* =====================================
            LOGO
        ===================================== */}

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

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              disabled={
                loading || googleLoading
              }
            />

          </div>

          <div className="admin-input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              disabled={
                loading || googleLoading
              }
            />

          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={
              loading || googleLoading
            }
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* =====================================
            DIVIDER
        ===================================== */}

        <div className="admin-login-divider">
          <span>
            OR
          </span>
        </div>

        {/* =====================================
            GOOGLE LOGIN
        ===================================== */}

        <button
          type="button"
          className="admin-google-btn"
          onClick={handleGoogleLogin}
          disabled={
            loading || googleLoading
          }
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

        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}

        {/* =====================================
            ADMIN NOTE
        ===================================== */}

        <p className="admin-login-note">
          Authorized administrators only.
        </p>

      </div>

    </div>
  );
}