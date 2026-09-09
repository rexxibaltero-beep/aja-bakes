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
import "./CustomerLogin.css";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("🔥 STEP 1: Starting Google popup...");

      /* =====================================
         GOOGLE SIGN-IN
      ===================================== */

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(
        "🔥 STEP 2: Google popup completed!"
      );

      console.log(
        "🔥 Google result:",
        result
      );

      const user = result.user;

      console.log(
        "🔥 STEP 3: Google user:",
        user
      );

      console.log(
        "🔥 Email:",
        user.email
      );

      console.log(
        "🔥 UID:",
        user.uid
      );

      /* =====================================
         CUSTOMER REFERENCE
      ===================================== */

      console.log(
        "🔥 STEP 4: Creating customer reference..."
      );

      const customerRef = doc(
        db,
        "customers",
        user.uid
      );

      console.log(
        "🔥 STEP 5: Getting customer document..."
      );

      const customerSnapshot =
        await getDoc(customerRef);

      console.log(
        "🔥 STEP 6: Customer document received."
      );

      console.log(
        "🔥 Customer exists:",
        customerSnapshot.exists()
      );

      /* =====================================
         FIRST TIME LOGIN
      ===================================== */

      if (!customerSnapshot.exists()) {

        console.log(
          "🔥 STEP 7: Creating new customer profile..."
        );

        await setDoc(customerRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          phone: user.phoneNumber || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log(
          "🔥 STEP 8: New customer profile created!"
        );
      }

      /* =====================================
         EXISTING CUSTOMER
      ===================================== */

      else {

        console.log(
          "🔥 STEP 7: Updating existing customer..."
        );

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

        console.log(
          "🔥 STEP 8: Customer profile updated!"
        );
      }

      /* =====================================
         LOGIN SUCCESS
      ===================================== */

      console.log(
        "🔥 STEP 9: LOGIN SUCCESS!"
      );

      setMessage(
        "Login successful! Redirecting..."
      );

      console.log(
        "🔥 STEP 10: Navigating to /account..."
      );

      setTimeout(() => {
        navigate("/account");
      }, 500);

    } catch (error) {

      console.error(
        "🔥 GOOGLE LOGIN ERROR:",
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

      /* =====================================
         ERROR HANDLING
      ===================================== */

      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {
        setMessage(
          "Google login was cancelled."
        );
      }

      else if (
        error.code ===
        "auth/popup-blocked"
      ) {
        setMessage(
          "Google login was blocked. Please allow pop-ups in your browser."
        );
      }

      else if (
        error.code ===
        "auth/unauthorized-domain"
      ) {
        setMessage(
          "This website is not authorized for Google Login."
        );
      }

      else if (
        error.code ===
        "auth/account-exists-with-different-credential"
      ) {
        setMessage(
          "An account already exists using a different sign-in method."
        );
      }

      else if (
        error.code ===
        "auth/network-request-failed"
      ) {
        setMessage(
          "Network error. Please check your internet connection."
        );
      }

      else if (
        error.code ===
        "permission-denied"
      ) {
        setMessage(
          "Google login worked, but Firestore permission was denied."
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

  /* =========================================
     SIGN UP
  ========================================= */

  const handleSignUp = () => {
    navigate("/register");
  };

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="customer-login-page">

      <div className="customer-login-card">

        {/* =====================================
            LOGO
        ===================================== */}

        <img
          src="/logo.png"
          alt="AJA Bakes"
          className="customer-login-logo"
        />

        {/* =====================================
            TITLE
        ===================================== */}

        <h1>AJA BAKES</h1>

        <p className="login-subtitle">
          Welcome! Please login to continue.
        </p>

        {/* =====================================
            GOOGLE LOGIN BUTTON
        ===================================== */}

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

        {/* =====================================
            MESSAGE
        ===================================== */}

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        {/* =====================================
            SIGN UP
        ===================================== */}

        <div className="account-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
          >
            Sign up
          </button>

        </div>

      </div>

    </div>
  );
}