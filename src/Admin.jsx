import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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

  const [expenses, setExpenses] = useState(() => {
    return Number(localStorage.getItem("ajaBakesExpenses")) || 0;
  });

  const [expenseInput, setExpenseInput] = useState("");

  const statusOptions = [
    "Pending",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  /* =========================================
     AUTHENTICATION
  ========================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin", { replace: true });
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* =========================================
     FETCH ORDERS
  ========================================= */

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(ordersQuery);

      const orderList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Unable to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      fetchOrders();
    }
  }, [checkingAuth]);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });

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
      console.error("Error updating status:", error);
      alert("Unable to update order status.");
    }
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    try {
      await auth.signOut();

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =========================================
     DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  /* =========================================
     PRICE
  ========================================= */

  const getPriceNumber = (price) => {
    return Number(
      String(price || "")
        .replace("₱", "")
        .replace(",", "")
    );
  };

  /* =========================================
     BUSINESS STATISTICS
  ========================================= */

  const validOrders = orders.filter(
    (order) => order.status !== "Cancelled"
  );

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const totalSales = validOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const completedSales = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const netProfit = totalSales - expenses;

  const profitMargin =
    totalSales > 0
      ? ((netProfit / totalSales) * 100).toFixed(1)
      : "0.0";

  /* =========================================
     MONTHLY SALES
  ========================================= */

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentMonth = new Date().getMonth();

  const monthlySales = monthNames.map((month, index) => {
    const sales = validOrders
      .filter((order) => {
        if (!order.createdAt) return false;

        const date = new Date(order.createdAt);

        return (
          date.getMonth() === index &&
          date.getFullYear() === new Date().getFullYear()
        );
      })
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

    return {
      month,
      sales,
    };
  });

  const visibleMonthlySales = monthlySales.slice(
    Math.max(0, currentMonth - 5),
    currentMonth + 1
  );

  const maxSales = Math.max(
    ...visibleMonthlySales.map((item) => item.sales),
    1
  );

  /* =========================================
     MONTHLY ORDERS
  ========================================= */

  const monthlyOrders = monthNames.map((month, index) => {
    const count = validOrders.filter((order) => {
      if (!order.createdAt) return false;

      const date = new Date(order.createdAt);

      return (
        date.getMonth() === index &&
        date.getFullYear() === new Date().getFullYear()
      );
    }).length;

    return {
      month,
      count,
    };
  });

  const visibleMonthlyOrders = monthlyOrders.slice(
    Math.max(0, currentMonth - 5),
    currentMonth + 1
  );

  const maxOrders = Math.max(
    ...visibleMonthlyOrders.map((item) => item.count),
    1
  );

  /* =========================================
     BEST SELLING PRODUCTS
  ========================================= */

  const productSales = {};

  validOrders.forEach((order) => {
    if (!order.products) return;

    order.products.forEach((product) => {
      if (!productSales[product.name]) {
        productSales[product.name] = {
          name: product.name,
          quantity: 0,
          image: product.image,
        };
      }

      productSales[product.name].quantity +=
        Number(product.quantity || 0);
    });
  });

  const bestSellingProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const maxProductQuantity = Math.max(
    ...bestSellingProducts.map(
      (product) => product.quantity
    ),
    1
  );

  /* =========================================
     SAVE EXPENSE
  ========================================= */

  const saveExpenses = () => {
    const amount = Number(expenseInput);

    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    setExpenses(amount);

    localStorage.setItem(
      "ajaBakesExpenses",
      amount
    );

    setExpenseInput("");
  };

  /* =========================================
     AUTH LOADING
  ========================================= */

  if (checkingAuth) {
    return (
      <div className="admin-loading">
        <div className="loading-bread">🥖</div>
        <p>Checking admin access...</p>
      </div>
    );
  }

  /* =========================================
     ADMIN PANEL
  ========================================= */

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

          <p>Bakery Management</p>

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
            <span>▦</span>
            Dashboard
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
            <span>🛒</span>
            Orders
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
            <span>🥐</span>
            Products
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
            <span>💬</span>
            Messages
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-bread-decoration">
            <span>🥖</span>
            <span>🥐</span>
            <span>🍞</span>
          </div>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="admin-content">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <div className="header-eyebrow">
              AJA BAKES • BAKERY MANAGEMENT
            </div>

            <h1>
              {activeSection === "dashboard" &&
                "Good day, Baker!"}

              {activeSection === "orders" &&
                "Customer Orders"}

              {activeSection === "products" &&
                "Our Products"}

              {activeSection === "messages" &&
                "Customer Messages"}
            </h1>

            <p>
              {activeSection === "dashboard" &&
                "Here's how your bakery is doing today."}

              {activeSection === "orders" &&
                "Manage and monitor customer orders."}

              {activeSection === "products" &&
                "Manage your AJA Bakes products."}

              {activeSection === "messages" &&
                "View customer inquiries."}
            </p>

          </div>

          <div className="admin-profile">

            <div className="profile-avatar">
              👩🏻‍🍳
            </div>

            <div>
              <strong>Admin</strong>
              <span>Bakery Manager</span>
            </div>

          </div>

        </header>


        {/* =====================================
            DASHBOARD
        ===================================== */}

        {activeSection === "dashboard" && (
          <>

            {/* HERO */}

            <section className="bakery-hero">

              <div className="hero-content">

                <span className="hero-small">
                  FRESH FROM THE OVEN
                </span>

                <h2>
                  Baking happiness,
                  <br />
                  one order at a time.
                </h2>

                <p>
                  Keep track of your sales,
                  orders and bakery performance.
                </p>

              </div>

              <div className="hero-products">

                <img
                  src="/products/cinnamon_regular.png"
                  alt="Cinnamon Roll"
                />

                <img
                  src="/products/garlicbun.png"
                  alt="Garlic Cheese Bun"
                />

                <img
                  src="/products/waffles.png"
                  alt="Waffle"
                />

              </div>

            </section>


            {/* STAT CARDS */}

            <section className="admin-stats">

              <div className="admin-stat-card">

                <div className="stat-icon">
                  ₱
                </div>

                <div>
                  <p>Total Revenue</p>

                  <h2>
                    ₱{totalSales.toFixed(2)}
                  </h2>

                  <small>
                    From active orders
                  </small>
                </div>

              </div>


              <div className="admin-stat-card">

                <div className="stat-icon">
                  🛒
                </div>

                <div>
                  <p>Total Orders</p>

                  <h2>
                    {totalOrders}
                  </h2>

                  <small>
                    {completedOrders.length} completed
                  </small>
                </div>

              </div>


              <div className="admin-stat-card">

                <div className="stat-icon">
                  ⏳
                </div>

                <div>
                  <p>Pending</p>

                  <h2>
                    {pendingOrders}
                  </h2>

                  <small>
                    Orders waiting
                  </small>
                </div>

              </div>


              <div className="admin-stat-card">

                <div className="stat-icon">
                  🥖
                </div>

                <div>
                  <p>Products</p>

                  <h2>11</h2>

                  <small>
                    Available items
                  </small>
                </div>

              </div>

            </section>


            {/* SALES + PROFIT */}

            <section className="dashboard-grid">

              {/* SALES GRAPH */}

              <div className="dashboard-card sales-card">

                <div className="card-heading">

                  <div>
                    <span>BUSINESS PERFORMANCE</span>

                    <h2>Sales Overview</h2>

                    <p>
                      Revenue for the last 6 months
                    </p>
                  </div>

                  <div className="mini-badge">
                    📈 Sales
                  </div>

                </div>


                <div className="sales-chart">

                  {visibleMonthlySales.map(
                    (item) => {

                      const height =
                        item.sales === 0
                          ? 4
                          : Math.max(
                              (item.sales /
                                maxSales) *
                                170,
                              10
                            );

                      return (
                        <div
                          className="sales-bar-column"
                          key={item.month}
                        >

                          <div className="bar-value">
                            {item.sales > 0
                              ? `₱${item.sales.toLocaleString()}`
                              : ""}
                          </div>

                          <div className="sales-bar-area">

                            <div
                              className="sales-bar"
                              style={{
                                height: `${height}px`,
                              }}
                            />

                          </div>

                          <span>
                            {item.month}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>


              {/* PROFIT CARD */}

              <div
                className={`profit-card ${
                  netProfit >= 0
                    ? "profit"
                    : "loss"
                }`}
              >

                <div className="profit-top">

                  <span>
                    BUSINESS HEALTH
                  </span>

                  <span className="profit-icon">
                    {netProfit >= 0
                      ? "↗"
                      : "↘"}
                  </span>

                </div>


                <div className="profit-bread">
                  {netProfit >= 0
                    ? "🥖"
                    : "🥀"}
                </div>


                <h2>
                  {netProfit >= 0
                    ? "PROFITABLE"
                    : "LOSS"}
                </h2>


                <div className="profit-number">
                  {netProfit >= 0
                    ? "+"
                    : "-"}
                  ₱
                  {Math.abs(
                    netProfit
                  ).toFixed(2)}
                </div>


                <p>
                  {netProfit >= 0
                    ? "Your current revenue is higher than your recorded expenses."
                    : "Your recorded expenses are higher than your current revenue."}
                </p>


                <div className="profit-details">

                  <div>
                    <span>Revenue</span>
                    <strong>
                      ₱{totalSales.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Expenses</span>
                    <strong>
                      ₱{expenses.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Margin</span>
                    <strong>
                      {profitMargin}%
                    </strong>
                  </div>

                </div>

              </div>

            </section>


            {/* ORDERS GRAPH + TOP PRODUCTS */}

            <section className="dashboard-grid">

              {/* ORDER GRAPH */}

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>
                    <span>ORDER ACTIVITY</span>

                    <h2>Orders Overview</h2>

                    <p>
                      Number of orders per month
                    </p>
                  </div>

                </div>


                <div className="order-chart">

                  {visibleMonthlyOrders.map(
                    (item) => {

                      const height =
                        item.count === 0
                          ? 4
                          : Math.max(
                              (item.count /
                                maxOrders) *
                                145,
                              10
                            );

                      return (
                        <div
                          className="order-bar-column"
                          key={item.month}
                        >

                          <div className="order-bar-value">
                            {item.count}
                          </div>

                          <div className="order-bar-area">

                            <div
                              className="order-bar"
                              style={{
                                height: `${height}px`,
                              }}
                            />

                          </div>

                          <span>
                            {item.month}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>


              {/* BEST SELLERS */}

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>
                    <span>BAKERY FAVORITES</span>

                    <h2>Best Sellers</h2>

                    <p>
                      Most ordered products
                    </p>
                  </div>

                  <span className="bread-label">
                    🥐
                  </span>

                </div>


                {bestSellingProducts.length === 0 ? (

                  <div className="small-empty">

                    <span>🥖</span>

                    <p>
                      Your best sellers
                      will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="best-sellers">

                    {bestSellingProducts.map(
                      (product, index) => {

                        const percentage =
                          (product.quantity /
                            maxProductQuantity) *
                          100;

                        return (
                          <div
                            className="best-product"
                            key={product.name}
                          >

                            <div className="product-rank">
                              {index + 1}
                            </div>

                            <img
                              src={
                                product.image ||
                                "/logo.png"
                              }
                              alt={product.name}
                            />

                            <div className="best-product-info">

                              <div className="best-product-name">
                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.quantity} sold
                                </span>
                              </div>

                              <div className="product-progress">
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </section>


            {/* EXPENSE MANAGEMENT */}

            <section className="expense-section">

              <div className="expense-info">

                <span>
                  💸 FINANCIAL MANAGEMENT
                </span>

                <h2>
                  Track Your Expenses
                </h2>

                <p>
                  Enter your current total expenses
                  for ingredients, packaging,
                  utilities, and other bakery costs.
                </p>

                <div className="expense-current">

                  <span>Recorded expenses</span>

                  <strong>
                    ₱{expenses.toFixed(2)}
                  </strong>

                </div>

              </div>


              <div className="expense-form">

                <label>
                  Update total expenses
                </label>

                <div className="expense-input-row">

                  <span>₱</span>

                  <input
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    value={expenseInput}
                    onChange={(e) =>
                      setExpenseInput(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={saveExpenses}
                  >
                    SAVE
                  </button>

                </div>

                <small>
                  Profit = Revenue − Expenses
                </small>

              </div>

            </section>


            {/* RECENT ORDERS */}

            <section className="admin-section">

              <div className="section-header">

                <div>

                  <span className="section-eyebrow">
                    CUSTOMER ACTIVITY
                  </span>

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
                    setActiveSection("orders")
                  }
                >
                  View All →
                </button>

              </div>


              {orders.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🥖
                  </div>

                  <h3>
                    No orders yet
                  </h3>

                  <p>
                    Customer orders will appear here.
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

                        <div className="recent-customer">

                          <div className="customer-icon">
                            {order.customerName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "A"}
                          </div>

                          <div>

                            <strong>
                              {order.customerName}
                            </strong>

                            <p>
                              {order.orderMethod}
                            </p>

                          </div>

                        </div>


                        <div className="recent-order-right">

                          <strong>
                            ₱
                            {Number(
                              order.total || 0
                            ).toFixed(2)}
                          </strong>

                          <span
                            className={`status-pill ${
                              String(
                                order.status ||
                                  "Pending"
                              ).toLowerCase()
                            }`}
                          >
                            {order.status ||
                              "Pending"}
                          </span>

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

                <span className="section-eyebrow">
                  ORDER MANAGEMENT
                </span>

                <h2>
                  Customer Orders
                </h2>

                <p>
                  Orders submitted from the website.
                </p>

              </div>

              <button
                className="admin-action-btn"
                onClick={fetchOrders}
              >
                ↻ Refresh
              </button>

            </div>


            {loadingOrders ? (

              <div className="empty-state">

                <div className="empty-icon">
                  🥖
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
                  Customer orders will appear here.
                </p>

              </div>

            ) : (

              <div className="admin-orders-list">

                {orders.map((order) => (

                  <div
                    className="admin-order-card"
                    key={order.id}
                  >

                    <div className="admin-order-header">

                      <div>

                        <span className="order-label">
                          CUSTOMER
                        </span>

                        <h3>
                          {order.customerName}
                        </h3>

                        <p>
                          Order ID: {order.id}
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


                    <div className="admin-order-info">

                      <div>
                        <span>📞</span>
                        <strong>Contact</strong>
                        <p>
                          {order.contactNumber ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <span>📍</span>
                        <strong>Method</strong>
                        <p>
                          {order.orderMethod ||
                            "N/A"}
                        </p>
                      </div>

                      {order.orderMethod ===
                        "Delivery" && (
                        <div>
                          <span>🏠</span>
                          <strong>Address</strong>
                          <p>
                            {order.address ||
                              "N/A"}
                          </p>
                        </div>
                      )}

                      <div>
                        <span>📅</span>
                        <strong>Schedule</strong>
                        <p>
                          {formatDate(
                            order.preferredDate
                          )}

                          {order.preferredTime &&
                            ` • ${order.preferredTime}`}
                        </p>
                      </div>

                    </div>


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
                                getPriceNumber(
                                  product.price
                                ) *
                                product.quantity
                              ).toFixed(2)}
                            </strong>

                          </div>

                        )
                      )}

                    </div>


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

                <span className="section-eyebrow">
                  BAKERY MENU
                </span>

                <h2>
                  Products
                </h2>

                <p>
                  Manage your AJA Bakes products.
                </p>

              </div>

            </div>


            <div className="admin-product-showcase">

              <div>
                <img
                  src="/products/cinnamon_regular.png"
                  alt="Classic Cinnamon Roll"
                />

                <h3>
                  Cinnamon Rolls
                </h3>

                <p>
                  Freshly baked favorites
                </p>
              </div>

              <div>
                <img
                  src="/products/garlicbun.png"
                  alt="Garlic Cheese Bun"
                />

                <h3>
                  Garlic Cheese Bun
                </h3>

                <p>
                  Savory bakery favorite
                </p>
              </div>

              <div>
                <img
                  src="/products/waffles.png"
                  alt="Waffles"
                />

                <h3>
                  Waffles
                </h3>

                <p>
                  Sweet and freshly made
                </p>
              </div>

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

                <span className="section-eyebrow">
                  CUSTOMER CARE
                </span>

                <h2>
                  Messages
                </h2>

                <p>
                  Customer messages will appear here.
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
                Customer inquiries will appear here.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}