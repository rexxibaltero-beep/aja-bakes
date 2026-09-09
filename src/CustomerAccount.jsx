import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "./firebase";
import "./CustomerAccount.css";

export default function CustomerAccount() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="customer-account-page">
        <div className="account-loading">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="customer-account-page">

      <div className="customer-account-card">

        {/* PROFILE PHOTO */}
        <div className="account-photo-wrapper">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Customer"
              className="account-photo"
            />
          ) : (
            <div className="account-photo-placeholder">
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : "A"}
            </div>
          )}
        </div>

        {/* TITLE */}
        <h1>MY ACCOUNT</h1>

        <p className="account-welcome">
          Welcome back!
        </p>

        {/* CUSTOMER INFORMATION */}
        <div className="account-info">

          <div className="account-info-item">
            <span className="account-label">
              Name
            </span>

            <span className="account-value">
              {user.displayName || "Customer"}
            </span>
          </div>

          <div className="account-info-item">
            <span className="account-label">
              Email
            </span>

            <span className="account-value">
              {user.email || "No email available"}
            </span>
          </div>

        </div>

        {/* ORDERS */}
        <button
          type="button"
          className="account-orders-btn"
          onClick={() => navigate("/orders")}
        >
          My Orders
        </button>

        {/* BACK HOME */}
        <button
          type="button"
          className="account-home-btn"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

        {/* LOGOUT */}
        <button
          type="button"
          className="account-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}