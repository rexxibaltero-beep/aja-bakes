import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth, db } from "./firebase";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setMessage("");

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("Google registration successful:", user);

      // CUSTOMER DOCUMENT
      const customerRef = doc(db, "customers", user.uid);
      const customerSnapshot = await getDoc(customerRef);

      // CREATE CUSTOMER PROFILE
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

        console.log("New customer registered.");
      }

      // UPDATE EXISTING CUSTOMER
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

        console.log("Existing customer profile updated.");
      }

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/account");
      }, 500);

    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setMessage("Google registration was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setMessage(
          "Google registration was blocked. Please allow pop-ups."
        );
      } else if (error.code === "auth/network-request-failed") {
        setMessage(
          "Network error. Please check your internet connection."
        );
      } else {
        setMessage(
          "Unable to register with Google. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="register-page">

      <div className="register-card">

        {/* LOGO */}
        <img
          src="/logo.png"
          alt="AJA Bakes"
          className="register-logo"
        />

        {/* TITLE */}
        <h1>CREATE ACCOUNT</h1>

        <p className="register-subtitle">
          Join AJA Bakes and enjoy freshly baked treats. 🤎
        </p>

        {/* GOOGLE REGISTER */}
        <button
          type="button"
          className="google-register-btn"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <span className="google-register-icon">
            G
          </span>

          <span>
            {loading
              ? "Creating account..."
              : "Sign up with Google"}
          </span>
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        {/* LOGIN */}
        <div className="login-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={handleLogin}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}