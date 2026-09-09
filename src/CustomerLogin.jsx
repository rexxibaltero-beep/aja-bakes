import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth, db } from "./firebase";
import "./CustomerLogin.css";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      // GOOGLE SIGN-IN
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("Google login successful:", user);

      // CUSTOMER DOCUMENT
      const customerRef = doc(db, "customers", user.uid);

      const customerSnapshot = await getDoc(customerRef);

      // =========================================
      // FIRST TIME LOGIN
      // =========================================

      if (!customerSnapshot.exists()) {
        await setDoc(customerRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          phone: user.phoneNumber || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log("New customer profile created.");
      }

      // =========================================
      // EXISTING CUSTOMER
      // =========================================

      else {
        await setDoc(
          customerRef,
          {
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            updatedAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        console.log("Customer profile updated.");
      }

      setMessage("Login successful!");

      // Redirect after login
      setTimeout(() => {
        navigate("/account");
      }, 500);

    } catch (error) {
      console.error("Google login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setMessage("Google login was cancelled.");
      }

      else if (error.code === "auth/popup-blocked") {
        setMessage(
          "Google login was blocked. Please allow pop-ups in your browser."
        );
      }

      else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setMessage(
          "An account already exists using a different sign-in method."
        );
      }

      else if (error.code === "auth/network-request-failed") {
        setMessage(
          "Network error. Please check your internet connection."
        );
      }

      else {
        setMessage(
          "Unable to login with Google. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SIGN UP
  // =========================================

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="customer-login-page">

      <div className="customer-login-card">

        {/* =========================================
            LOGO
        ========================================= */}

        <img
          src="/logo.png"
          alt="AJA Bakes"
          className="customer-login-logo"
        />

        {/* =========================================
            TITLE
        ========================================= */}

        <h1>AJA BAKES</h1>

        <p className="login-subtitle">
          Welcome! Please login to continue.
        </p>

        {/* =========================================
            GOOGLE LOGIN
        ========================================= */}

        <button
          type="button"
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="google-icon">
            G
          </span>

          <span>
            {loading
              ? "Signing in..."
              : "Continue with Google"}
          </span>
        </button>

        {/* =========================================
            MESSAGE
        ========================================= */}

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        {/* =========================================
            SIGN UP
        ========================================= */}

        <div className="account-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={handleSignUp}
          >
            Sign up
          </button>

        </div>

      </div>

    </div>
  );
}