import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const statusOptions = [
    "Pending",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  // =========================================
  // AUTHENTICATION CHECK
  // =========================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          navigate("/admin", { replace: true });
        } else {
          setCheckingAuth(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =========================================
  // FETCH ORDERS
  // =========================================

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(ordersQuery);

      const orderList = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      setOrders(orderList);
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error
      );

      alert("Unable to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch orders after authentication
  useEffect(() => {
    if (!checkingAuth) {
      fetchOrders();
    }
  }, [checkingAuth]);

  // =========================================
  // UPDATE ORDER STATUS
  // =========================================

  const updateStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      await updateDoc(
        doc(db, "orders", orderId),
        {
          status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Error updating status:",
        error
      );

      alert(
        "Unable to update order status."
      );
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    try {
      await auth.signOut();

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(
        date
      ).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // =========================================
  // DASHBOARD STATISTICS
  // =========================================

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending"
  ).length;

  const totalSales = orders
    .filter(
      (order) =>
        order.status !== "Cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

  // =========================================
  // AUTH LOADING SCREEN
  // =========================================

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fffaf6",
          color: "#5b3527",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  // =========================================
  // ADMIN PANEL
  // =========================================

  return (
    <div className="admin-page">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-logo">

          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
          />

          <h2>AJA BAKES</h2>

          <p>Admin Panel</p>

        </div>


        <nav className="admin-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "admin-nav-btn active"
                : "admin-nav-btn"
            }
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            📊 Dashboard
          </button>


          <button
            className={
              activeSection === "orders"
                ? "admin-nav-btn active"
                : "admin-nav-btn"
            }
            onClick={() =>
              setActiveSection("orders")
            }
          >
            🛒 Orders
          </button>


          <button
            className={
              activeSection === "products"
                ? "admin-nav-btn active"
                : "admin-nav-btn"
            }
            onClick={() =>
              setActiveSection("products")
            }
          >
            🍰 Products
          </button>


          <button
            className={
              activeSection === "messages"
                ? "admin-nav-btn active"
                : "admin-nav-btn"
            }
            onClick={() =>
              setActiveSection("messages")
            }
          >
            💬 Messages
          </button>

        </nav>


        {/* LOGOUT */}

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>


      {/* MAIN CONTENT */}

      <main className="admin-content">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <h1>
              {activeSection ===
                "dashboard" &&
                "Dashboard"}

              {activeSection ===
                "orders" &&
                "Orders"}

              {activeSection ===
                "products" &&
                "Products"}

              {activeSection ===
                "messages" &&
                "Messages"}
            </h1>


            <p>
              {activeSection ===
                "dashboard" &&
                "Welcome to the AJA Bakes Admin Panel."}

              {activeSection ===
                "orders" &&
                "Manage customer orders."}

              {activeSection ===
                "products" &&
                "Manage your AJA Bakes products."}

              {activeSection ===
                "messages" &&
                "View customer messages."}
            </p>

          </div>


          <div className="admin-profile">

            <span>👤</span>

            <strong>Admin</strong>

          </div>

        </header>


        {/* =====================================
            DASHBOARD
        ===================================== */}

        {activeSection === "dashboard" && (
          <>

            <section className="admin-stats">

              <div className="admin-stat-card">

                <span className="stat-icon">
                  🛒
                </span>

                <div>
                  <p>Total Orders</p>

                  <h2>
                    {totalOrders}
                  </h2>
                </div>

              </div>


              <div className="admin-stat-card">

                <span className="stat-icon">
                  ⏳
                </span>

                <div>
                  <p>Pending Orders</p>

                  <h2>
                    {pendingOrders}
                  </h2>
                </div>

              </div>


              <div className="admin-stat-card">

                <span className="stat-icon">
                  💰
                </span>

                <div>
                  <p>Total Sales</p>

                  <h2>
                    ₱{totalSales.toFixed(2)}
                  </h2>
                </div>

              </div>


              <div className="admin-stat-card">

                <span className="stat-icon">
                  🍰
                </span>

                <div>
                  <p>Products</p>

                  <h2>11</h2>
                </div>

              </div>

            </section>


            {/* RECENT ORDERS */}

            <section className="admin-section">

              <div className="section-header">

                <div>

                  <h2>
                    Recent Orders
                  </h2>

                  <p>
                    Latest customer orders.
                  </p>

                </div>


                <button
                  className="admin-action-btn"
                  onClick={() =>
                    setActiveSection(
                      "orders"
                    )
                  }
                >
                  View All
                </button>

              </div>


              {orders.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🛒
                  </div>

                  <h3>
                    No orders yet
                  </h3>

                  <p>
                    Customer orders will
                    appear here.
                  </p>

                </div>

              ) : (

                <div className="recent-orders">

                  {orders
                    .slice(0, 5)
                    .map((order) => (

                      <div
                        className="recent-order-row"
                        key={order.id}
                      >

                        <div>

                          <strong>
                            {order.customerName}
                          </strong>

                          <p>
                            {order.orderMethod}
                          </p>

                        </div>


                        <div>

                          <strong>
                            ₱
                            {Number(
                              order.total || 0
                            ).toFixed(2)}
                          </strong>

                          <p>
                            {order.status ||
                              "Pending"}
                          </p>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>

          </>
        )}


        {/* =====================================
            ORDERS
        ===================================== */}

        {activeSection === "orders" && (

          <section className="admin-section">

            <div className="section-header">

              <div>

                <h2>
                  Customer Orders
                </h2>

                <p>
                  Orders submitted from
                  the website.
                </p>

              </div>


              <button
                className="admin-action-btn"
                onClick={fetchOrders}
              >
                🔄 Refresh
              </button>

            </div>


            {loadingOrders ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ⏳
                </div>

                <h3>
                  Loading orders...
                </h3>

              </div>

            ) : orders.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  🛒
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Customer orders will
                  appear here.
                </p>

              </div>

            ) : (

              <div className="admin-orders-list">

                {orders.map((order) => (

                  <div
                    className="admin-order-card"
                    key={order.id}
                  >

                    {/* ORDER HEADER */}

                    <div className="admin-order-header">

                      <div>

                        <h3>
                          {order.customerName}
                        </h3>

                        <p>
                          Order ID:{" "}
                          {order.id}
                        </p>

                      </div>


                      <select
                        value={
                          order.status ||
                          "Pending"
                        }
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value
                          )
                        }
                        className="order-status-select"
                      >

                        {statusOptions.map(
                          (status) => (

                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* CUSTOMER INFORMATION */}

                    <div className="admin-order-info">

                      <div>

                        <span>📞</span>

                        <strong>
                          Contact
                        </strong>

                        <p>
                          {order.contactNumber ||
                            "N/A"}
                        </p>

                      </div>


                      <div>

                        <span>📍</span>

                        <strong>
                          Method
                        </strong>

                        <p>
                          {order.orderMethod ||
                            "N/A"}
                        </p>

                      </div>


                      {order.orderMethod ===
                        "Delivery" && (

                        <div>

                          <span>🏠</span>

                          <strong>
                            Address
                          </strong>

                          <p>
                            {order.address ||
                              "N/A"}
                          </p>

                        </div>

                      )}


                      <div>

                        <span>📅</span>

                        <strong>
                          Schedule
                        </strong>

                        <p>

                          {formatDate(
                            order.preferredDate
                          )}

                          {order.preferredTime &&
                            ` • ${order.preferredTime}`}

                        </p>

                      </div>

                    </div>


                    {/* PRODUCTS */}

                    <div className="admin-order-products">

                      <h4>
                        Products
                      </h4>


                      {order.products?.map(
                        (product) => (

                          <div
                            className="admin-product-row"
                            key={product.id}
                          >

                            <div className="admin-product-left">

                              <img
                                src={product.image}
                                alt={product.name}
                              />

                              <div>

                                <strong>
                                  {product.name}
                                </strong>

                                <p>
                                  {product.price} ×{" "}
                                  {product.quantity}
                                </p>

                              </div>

                            </div>


                            <strong>

                              ₱
                              {(
                                Number(
                                  String(
                                    product.price
                                  )
                                    .replace(
                                      "₱",
                                      ""
                                    )
                                    .replace(
                                      ",",
                                      ""
                                    )
                                ) *
                                product.quantity
                              ).toFixed(2)}

                            </strong>

                          </div>

                        )
                      )}

                    </div>


                    {/* SPECIAL INSTRUCTIONS */}

                    {order.notes && (

                      <div className="admin-order-notes">

                        <strong>
                          📝 Special Instructions
                        </strong>

                        <p>
                          {order.notes}
                        </p>

                      </div>

                    )}


                    {/* TOTAL */}

                    <div className="admin-order-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        ₱
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </strong>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* =====================================
            PRODUCTS
        ===================================== */}

        {activeSection === "products" && (

          <section className="admin-section">

            <div className="section-header">

              <div>

                <h2>
                  Products
                </h2>

                <p>
                  Manage your AJA Bakes
                  products.
                </p>

              </div>


              <button className="admin-action-btn">
                + Add Product
              </button>

            </div>


            <div className="empty-state">

              <div className="empty-icon">
                🍰
              </div>

              <h3>
                Product management
              </h3>

              <p>
                We can connect this to
                Firebase next.
              </p>

            </div>

          </section>

        )}


        {/* =====================================
            MESSAGES
        ===================================== */}

        {activeSection === "messages" && (

          <section className="admin-section">

            <div className="section-header">

              <div>

                <h2>
                  Messages
                </h2>

                <p>
                  Customer messages will
                  appear here.
                </p>

              </div>

            </div>


            <div className="empty-state">

              <div className="empty-icon">
                💬
              </div>

              <h3>
                No messages yet
              </h3>

              <p>
                Customer inquiries will
                appear here.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}