import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, db } from "./firebase";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expenses, setExpenses] = useState(() => {
    return Number(localStorage.getItem("ajaBakesExpenses") || 0);
  });

  const [expenseInput, setExpenseInput] = useState("");

  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  /* =========================================
     AUTH
  ========================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin");
      } else {
        loadOrders();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* =========================================
     MOBILE SIDEBAR
  ========================================= */

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setDateDropdownOpen(false);
        setStatusDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =========================================
     LOAD ORDERS
  ========================================= */

  const loadOrders = async () => {
    try {
      setLoading(true);

      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(ordersQuery);

      const orderData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setOrders(orderData);
    } catch (error) {
      console.error("Error loading orders:", error);

      try {
        const snapshot = await getDocs(collection(db, "orders"));

        const orderData = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setOrders(orderData);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     STATUS PRIORITY
  ========================================= */

  const statusPriority = {
    Pending: 1,
    Processing: 2,
    Completed: 3,
    Cancelled: 4,
  };

  /* =========================================
     SORT ORDERS
  ========================================= */

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const statusA = statusPriority[a.status] || 99;
      const statusB = statusPriority[b.status] || 99;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    });
  }, [orders]);

  /* =========================================
     VALID ORDERS
  ========================================= */

  const validOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status !== "Cancelled"
    );
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "Completed"
    );
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "Pending"
    );
  }, [orders]);

  const processingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "Processing"
    );
  }, [orders]);

  /* =========================================
     SALES
  ========================================= */

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
     PRODUCTS SOLD
  ========================================= */

  const productsSold = validOrders.reduce((sum, order) => {
    if (!order.products) return sum;

    return (
      sum +
      order.products.reduce(
        (productSum, product) =>
          productSum + Number(product.quantity || 0),
        0
      )
    );
  }, 0);

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

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const monthlySales = monthNames.map((month, index) => {
    const sales = validOrders
      .filter((order) => {
        if (!order.createdAt) return false;

        const date = new Date(order.createdAt);

        return (
          date.getMonth() === index &&
          date.getFullYear() === currentYear
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

  const maxMonthlySales = Math.max(
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
        date.getFullYear() === currentYear
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

  const maxMonthlyOrders = Math.max(
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

      productSales[product.name].quantity += Number(
        product.quantity || 0
      );
    });
  });

  const bestSellingProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const highestProductQuantity = Math.max(
    ...bestSellingProducts.map(
      (product) => product.quantity
    ),
    1
  );

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);

      const orderRef = doc(db, "orders", orderId);

      const updateData = {
        status: newStatus,
      };

      if (newStatus === "Completed") {
        const currentUser = auth.currentUser;

        updateData.completedBy =
          currentUser?.email || "Staff";

        updateData.completedAt =
          new Date().toISOString();
      }

      await updateDoc(orderRef, updateData);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updateData,
              }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Unable to update order status.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  /* =========================================
     EXPENSES
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
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =========================================
     NAVIGATION
  ========================================= */

  const goToSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    setDateDropdownOpen(false);
    setStatusDropdownOpen(false);
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatMoney = (amount) => {
    return `₱${Number(amount || 0).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /* =========================================
     AVAILABLE DATES
  ========================================= */

  const availableDates = [
    ...new Set(
      orders
        .filter((order) => order.createdAt)
        .map((order) => {
          const date = new Date(order.createdAt);

          return date.toISOString().split("T")[0];
        })
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  /* =========================================
     DATE FILTERED ORDERS
  ========================================= */

  const filteredDateOrders = sortedOrders.filter((order) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      (order.customerName || "")
        .toLowerCase()
        .includes(search) ||
      (order.contactNumber || "")
        .toLowerCase()
        .includes(search) ||
      (order.id || "")
        .toLowerCase()
        .includes(search) ||
      (order.orderMethod || "")
        .toLowerCase()
        .includes(search) ||
      (order.products || []).some((product) =>
        (product.name || "")
          .toLowerCase()
          .includes(search)
      );

    const matchesDate =
      dateFilter === "all" ||
      (order.createdAt &&
        new Date(order.createdAt)
          .toISOString()
          .split("T")[0] === dateFilter);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return (
      matchesSearch &&
      matchesDate &&
      matchesStatus
    );
  });

  /* =========================================
     DATE DROPDOWN LABEL
  ========================================= */

  const selectedDateLabel =
    dateFilter === "all"
      ? "All Dates"
      : new Date(
          dateFilter + "T00:00:00"
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

  const selectedStatusLabel =
    statusFilter === "all"
      ? "All Status"
      : statusFilter;

  /* =========================================
     ORDER TABLE COMPONENT
  ========================================= */

  const OrderTable = ({
    title,
    subtitle,
    data,
    type,
  }) => {
    return (
      <section className="orders-table-card">
        <div className="orders-table-header">
          <div>
            <span className="section-eyebrow">
              ORDER MANAGEMENT
            </span>

            <h2>{title}</h2>

            <p>{subtitle}</p>
          </div>

          <span className={`table-count ${type}`}>
            {data.length}
          </span>
        </div>

        {data.length === 0 ? (
          <div className="table-empty">
            <div className="empty-bread">🥐</div>

            <h3>
              No {title.toLowerCase()}
            </h3>

            <p>
              Orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Total</th>

                  {type === "completed" && (
                    <th>Handled By</th>
                  )}

                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {data.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>
                        #
                        {order.id
                          .slice(-6)
                          .toUpperCase()}
                      </strong>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {(
                            order.customerName ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {order.customerName ||
                              "Customer"}
                          </strong>

                          <small>
                            {order.contactNumber ||
                              "No contact"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="method-text">
                        {order.orderMethod ||
                          "Pickup"}
                      </span>
                    </td>

                    <td>
                      <div className="date-cell">
                        <strong>
                          {formatDate(
                            order.createdAt
                          )}
                        </strong>

                        <small>
                          {formatTime(
                            order.createdAt
                          )}
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong className="price-text">
                        {formatMoney(
                          order.total
                        )}
                      </strong>
                    </td>

                    {type === "completed" && (
                      <td>
                        <div className="staff-cell">
                          <span>👤</span>

                          <small>
                            {order.completedBy ||
                              "Staff"}
                          </small>
                        </div>
                      </td>
                    )}

                    <td>
                      <span
                        className={`status-pill ${(
                          order.status ||
                          "Pending"
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {order.status ||
                          "Pending"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        {order.status ===
                          "Pending" && (
                          <button
                            className="action-btn processing-btn"
                            disabled={
                              updatingOrder ===
                              order.id
                            }
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                "Processing"
                              )
                            }
                          >
                            {updatingOrder ===
                            order.id
                              ? "..."
                              : "Process"}
                          </button>
                        )}

                        {order.status ===
                          "Processing" && (
                          <button
                            className="action-btn complete-btn"
                            disabled={
                              updatingOrder ===
                              order.id
                            }
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                "Completed"
                              )
                            }
                          >
                            {updatingOrder ===
                            order.id
                              ? "..."
                              : "Complete"}
                          </button>
                        )}

                        {order.status ===
                          "Completed" && (
                          <span className="done-label">
                            ✓ Done
                          </span>
                        )}

                        {order.status !==
                          "Cancelled" &&
                          order.status !==
                            "Completed" && (
                            <button
                              className="action-btn cancel-btn"
                              disabled={
                                updatingOrder ===
                                order.id
                              }
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  "Cancelled"
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-bread">
          🥐
        </div>

        <h2>Loading AJA Bakes...</h2>

        <p>Preparing your dashboard</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================
          MOBILE MENU BUTTON
      ===================================== */}

      <button
        className="admin-menu-toggle"
        onClick={() =>
          setSidebarOpen(true)
        }
        aria-label="Open admin menu"
      >
        ☰
      </button>

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <button
          className="admin-sidebar-close"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="admin-logo">
          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
          />

          <h2>AJA BAKES</h2>

          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              goToSection("dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activeSection === "orders"
                ? "active"
                : ""
            }
            onClick={() =>
              goToSection("orders")
            }
          >
            <span>🧾</span>
            Orders

            {pendingOrders.length > 0 && (
              <b className="nav-badge">
                {pendingOrders.length}
              </b>
            )}
          </button>

          <button
            className={
              activeSection === "date-orders"
                ? "active"
                : ""
            }
            onClick={() =>
              goToSection("date-orders")
            }
          >
            <span>📅</span>
            Orders by Date
          </button>

          <button
            className={
              activeSection === "products"
                ? "active"
                : ""
            }
            onClick={() =>
              goToSection("products")
            }
          >
            <span>🍞</span>
            Products
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-user">
            <div className="admin-user-icon">
              👤
            </div>

            <div>
              <strong>Administrator</strong>

              <small>
                {auth.currentUser?.email ||
                  "Admin"}
              </small>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>
      </aside>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="admin-main">

        {/* ===================================
            DASHBOARD
        =================================== */}

        {activeSection === "dashboard" && (
          <>

            <header className="admin-header">
              <div>

                <span className="header-eyebrow">
                  AJA BAKES • ADMIN
                </span>

                <h1>
                  Good day, Admin! 👋
                </h1>

                <p>
                  Here's what's happening
                  with your bakery today.
                </p>

              </div>

              <div className="header-date">
                📅{" "}
                {new Date().toLocaleDateString(
                  "en-PH",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </div>
            </header>

            {/* HERO */}

            <section className="bakery-hero">

              <div className="hero-content">

                <span className="hero-small">
                  FRESHLY BAKED
                </span>

                <h2>
                  Made with love,
                  <br />
                  baked for everyone.
                </h2>

                <p>
                  Keep track of your orders,
                  sales, and bakery performance
                  all in one place.
                </p>

              </div>

              <div className="hero-products">

                <img
                  src="/products/cinnamon_regular.png"
                  alt="Cinnamon Roll"
                />

                <img
                  src="/products/garlicbun.png"
                  alt="Garlic Bun"
                />

                <img
                  src="/products/waffles.png"
                  alt="Waffle"
                />

              </div>

            </section>

            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card">

                <span className="stat-icon">
                  🧾
                </span>

                <div>
                  <small>Total Orders</small>

                  <strong>
                    {orders.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card pending-stat">

                <span className="stat-icon">
                  ⏳
                </span>

                <div>
                  <small>Pending</small>

                  <strong>
                    {pendingOrders.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <span className="stat-icon">
                  🍞
                </span>

                <div>
                  <small>Products Sold</small>

                  <strong>
                    {productsSold}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <span className="stat-icon">
                  💰
                </span>

                <div>
                  <small>Total Sales</small>

                  <strong>
                    {formatMoney(totalSales)}
                  </strong>
                </div>

              </div>

            </section>

            {/* SALES + PROFIT */}

            <section className="dashboard-grid">

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>

                    <span className="section-eyebrow">
                      OVERVIEW
                    </span>

                    <h2>Monthly Sales</h2>

                  </div>

                  <span className="mini-badge">
                    {currentYear}
                  </span>

                </div>

                <div className="sales-chart">

                  {visibleMonthlySales.map(
                    (item) => (

                      <div
                        className="sales-bar-column"
                        key={item.month}
                      >

                        <span className="bar-value">

                          {item.sales > 0
                            ? `₱${(
                                item.sales /
                                1000
                              ).toFixed(1)}k`
                            : "₱0"}

                        </span>

                        <div className="sales-bar-area">

                          <div
                            className="sales-bar"
                            style={{
                              height: `${
                                (item.sales /
                                  maxMonthlySales) *
                                100
                              }%`,
                            }}
                          />

                        </div>

                        <small>
                          {item.month}
                        </small>

                      </div>

                    )
                  )}

                </div>

              </div>

              <div
                className={`dashboard-card profit-card ${
                  netProfit >= 0
                    ? "profit"
                    : "loss"
                }`}
              >

                <div className="profit-top">

                  <div>

                    <span className="section-eyebrow">
                      PROFIT & LOSS
                    </span>

                    <h2>
                      {netProfit >= 0
                        ? "Net Profit"
                        : "Net Loss"}
                    </h2>

                  </div>

                  <span className="profit-icon">
                    {netProfit >= 0
                      ? "📈"
                      : "📉"}
                  </span>

                </div>

                <div className="profit-number">
                  {formatMoney(netProfit)}
                </div>

                <div className="profit-details">

                  <div>
                    <span>Total Sales</span>

                    <strong>
                      {formatMoney(totalSales)}
                    </strong>
                  </div>

                  <div>
                    <span>Expenses</span>

                    <strong>
                      {formatMoney(expenses)}
                    </strong>
                  </div>

                  <div>
                    <span>Margin</span>

                    <strong>
                      {profitMargin}%
                    </strong>
                  </div>

                </div>

                <div className="profit-bread">
                  🥖
                </div>

              </div>

            </section>

            {/* ORDER CHART + BEST SELLERS */}

            <section className="dashboard-grid">

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>

                    <span className="section-eyebrow">
                      ORDERS
                    </span>

                    <h2>Monthly Orders</h2>

                  </div>

                </div>

                <div className="order-chart">

                  {visibleMonthlyOrders.map(
                    (item) => (

                      <div
                        className="order-bar-column"
                        key={item.month}
                      >

                        <span className="order-bar-value">
                          {item.count}
                        </span>

                        <div className="order-bar-area">

                          <div
                            className="order-bar"
                            style={{
                              height: `${
                                (item.count /
                                  maxMonthlyOrders) *
                                100
                              }%`,
                            }}
                          />

                        </div>

                        <small>
                          {item.month}
                        </small>

                      </div>

                    )
                  )}

                </div>

              </div>

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>

                    <span className="section-eyebrow">
                      TOP PRODUCTS
                    </span>

                    <h2>Best Sellers</h2>

                  </div>

                </div>

                {bestSellingProducts.length ===
                0 ? (

                  <div className="small-empty">
                    No product sales yet.
                  </div>

                ) : (

                  <div className="best-sellers">

                    {bestSellingProducts.map(
                      (product, index) => (

                        <div
                          className="best-product"
                          key={product.name}
                        >

                          <span className="product-rank">
                            #{index + 1}
                          </span>

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

                              <span
                                style={{
                                  width: `${
                                    (product.quantity /
                                      highestProductQuantity) *
                                    100
                                  }%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

            {/* EXPENSE */}

            <section className="expense-section">

              <div className="expense-info">

                <span className="section-eyebrow">
                  EXPENSE TRACKER
                </span>

                <h2>Manage Expenses</h2>

                <p>
                  Update the total expenses used
                  for the profit calculation.
                </p>

                <div className="expense-current">

                  Current expenses:

                  <strong>
                    {formatMoney(expenses)}
                  </strong>

                </div>

              </div>

              <div className="expense-form">

                <label>
                  New total expenses
                </label>

                <div className="expense-input-row">

                  <span>₱</span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
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
                    Save
                  </button>

                </div>

              </div>

            </section>

            {/* QUICK ORDER STATUS */}

            <section className="quick-orders">

              <div className="section-title-row">

                <div>

                  <span className="section-eyebrow">
                    ORDER MANAGEMENT
                  </span>

                  <h2>
                    Orders Needing Attention
                  </h2>

                </div>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    goToSection("orders")
                  }
                >
                  View All →
                </button>

              </div>

              <div className="quick-order-grid">

                {sortedOrders
                  .filter(
                    (order) =>
                      order.status ===
                        "Pending" ||
                      order.status ===
                        "Processing"
                  )
                  .slice(0, 6)
                  .map((order) => (

                    <div
                      className="quick-order-card"
                      key={order.id}
                    >

                      <div className="recent-customer">

                        <div className="customer-icon">

                          {(
                            order.customerName ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {order.customerName ||
                              "Customer"}
                          </strong>

                          <small>
                            #
                            {order.id
                              .slice(-6)
                              .toUpperCase()}
                          </small>

                        </div>

                      </div>

                      <span
                        className={`status-pill ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>

                      <strong className="recent-total">
                        {formatMoney(order.total)}
                      </strong>

                    </div>

                  ))}

                {sortedOrders.filter(
                  (order) =>
                    order.status ===
                      "Pending" ||
                    order.status ===
                      "Processing"
                ).length === 0 && (

                  <div className="no-attention">
                    🎉 No orders need
                    attention right now!
                  </div>

                )}

              </div>

            </section>

          </>
        )}

        {/* ===================================
            ORDERS
        =================================== */}

        {activeSection === "orders" && (
          <>

            <header className="admin-header">

              <div>

                <span className="header-eyebrow">
                  ORDER MANAGEMENT
                </span>

                <h1>Orders</h1>

                <p>
                  Manage pending, processing,
                  and completed bakery orders.
                </p>

              </div>

              <button
                className="refresh-btn"
                onClick={loadOrders}
              >
                ↻ Refresh
              </button>

            </header>

            <div className="order-summary-strip">

              <div>
                <span>Pending</span>

                <strong>
                  {pendingOrders.length}
                </strong>
              </div>

              <div>
                <span>Processing</span>

                <strong>
                  {processingOrders.length}
                </strong>
              </div>

              <div>
                <span>Completed</span>

                <strong>
                  {completedOrders.length}
                </strong>
              </div>

              <div>
                <span>Total</span>

                <strong>
                  {orders.length}
                </strong>
              </div>

            </div>

            <OrderTable
              title="Pending Orders"
              subtitle="Orders waiting to be processed."
              data={pendingOrders}
              type="pending"
            />

            <OrderTable
              title="Processing Orders"
              subtitle="Orders currently being prepared."
              data={processingOrders}
              type="processing"
            />

            <OrderTable
              title="Completed / Staff"
              subtitle="Completed orders and the staff member who handled them."
              data={completedOrders}
              type="completed"
            />

            <OrderTable
              title="Cancelled Orders"
              subtitle="Orders that have been cancelled."
              data={orders.filter(
                (order) =>
                  order.status === "Cancelled"
              )}
              type="cancelled"
            />

          </>
        )}

        {/* ===================================
            ORDERS BY DATE
        =================================== */}

        {activeSection === "date-orders" && (
          <>

            <header className="admin-header">

              <div>

                <span className="header-eyebrow">
                  ORDER HISTORY
                </span>

                <h1>Orders by Date</h1>

                <p>
                  View your orders according to
                  their order date.
                </p>

              </div>

            </header>

            {/* DATE FILTER */}

            <section className="date-filter-card">

              {/* SEARCH */}

              <div className="search-box">

                <span>🔍</span>

                <input
                  type="text"
                  placeholder="Search customer, order ID, product..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    ✕
                  </button>
                )}

              </div>

              {/* DATE DROPDOWN */}

              <div className="date-filter-group">

                <label>
                  Select Date
                </label>

                <div className="custom-date-dropdown">

                  <button
                    type="button"
                    className="custom-date-select"
                    onClick={() => {
                      setDateDropdownOpen(
                        (prev) => !prev
                      );

                      setStatusDropdownOpen(
                        false
                      );
                    }}
                  >

                    <span>
                      {selectedDateLabel}
                    </span>

                    <span className="dropdown-arrow">
                      {dateDropdownOpen
                        ? "⌃"
                        : "⌄"}
                    </span>

                  </button>

                  {dateDropdownOpen && (

                    <div className="custom-date-options">

                      <button
                        type="button"
                        className={
                          dateFilter === "all"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setDateFilter("all");
                          setDateDropdownOpen(
                            false
                          );
                        }}
                      >
                        All Dates
                      </button>

                      {availableDates.map(
                        (date) => (

                          <button
                            type="button"
                            key={date}
                            className={
                              dateFilter === date
                                ? "selected"
                                : ""
                            }
                            onClick={() => {
                              setDateFilter(
                                date
                              );

                              setDateDropdownOpen(
                                false
                              );
                            }}
                          >
                            {new Date(
                              date +
                                "T00:00:00"
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month:
                                  "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* STATUS DROPDOWN */}

              <div className="date-filter-group">

                <label>
                  Status
                </label>

                <div className="custom-date-dropdown">

                  <button
                    type="button"
                    className="custom-date-select"
                    onClick={() => {
                      setStatusDropdownOpen(
                        (prev) => !prev
                      );

                      setDateDropdownOpen(
                        false
                      );
                    }}
                  >

                    <span>
                      {selectedStatusLabel}
                    </span>

                    <span className="dropdown-arrow">
                      {statusDropdownOpen
                        ? "⌃"
                        : "⌄"}
                    </span>

                  </button>

                  {statusDropdownOpen && (

                    <div className="custom-date-options">

                      <button
                        type="button"
                        className={
                          statusFilter === "all"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setStatusFilter("all");

                          setStatusDropdownOpen(
                            false
                          );
                        }}
                      >
                        All Status
                      </button>

                      <button
                        type="button"
                        className={
                          statusFilter ===
                          "Pending"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setStatusFilter(
                            "Pending"
                          );

                          setStatusDropdownOpen(
                            false
                          );
                        }}
                      >
                        Pending
                      </button>

                      <button
                        type="button"
                        className={
                          statusFilter ===
                          "Processing"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setStatusFilter(
                            "Processing"
                          );

                          setStatusDropdownOpen(
                            false
                          );
                        }}
                      >
                        Processing
                      </button>

                      <button
                        type="button"
                        className={
                          statusFilter ===
                          "Completed"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setStatusFilter(
                            "Completed"
                          );

                          setStatusDropdownOpen(
                            false
                          );
                        }}
                      >
                        Completed
                      </button>

                      <button
                        type="button"
                        className={
                          statusFilter ===
                          "Cancelled"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setStatusFilter(
                            "Cancelled"
                          );

                          setStatusDropdownOpen(
                            false
                          );
                        }}
                      >
                        Cancelled
                      </button>

                    </div>

                  )}

                </div>

              </div>

              {/* RESULT COUNT */}

              <div className="date-result-count">

                <span>
                  Showing
                </span>

                <strong>
                  {filteredDateOrders.length}
                </strong>

                <span>
                  orders
                </span>

              </div>

            </section>

            {/* DATE ORDERS */}

            <section className="date-orders-card">

              {filteredDateOrders.length ===
              0 ? (

                <div className="table-empty">

                  <div className="empty-bread">
                    📅
                  </div>

                  <h3>
                    No orders found
                  </h3>

                  <p>
                    Try selecting another date
                    or status.
                  </p>

                </div>

              ) : (

                <div className="date-orders-list">

                  {filteredDateOrders.map(
                    (order) => (

                      <div
                        className="date-order-row"
                        key={order.id}
                      >

                        <div className="date-order-main">

                          <div className="date-order-icon">
                            🧾
                          </div>

                          <div>

                            <strong>
                              #
                              {order.id
                                .slice(-6)
                                .toUpperCase()}
                            </strong>

                            <span>
                              {order.customerName ||
                                "Customer"}
                            </span>

                            <small>
                              {formatTime(
                                order.createdAt
                              )}
                            </small>

                          </div>

                        </div>

                        <div className="date-order-method">
                          {order.orderMethod ||
                            "Pickup"}
                        </div>

                        <div className="date-order-total">
                          {formatMoney(
                            order.total
                          )}
                        </div>

                        <span
                          className={`status-pill ${(
                            order.status ||
                            "Pending"
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >
                          {order.status}
                        </span>

                        <div className="date-order-action">

                          {order.status ===
                            "Pending" && (

                            <button
                              className="action-btn processing-btn"
                              disabled={
                                updatingOrder ===
                                order.id
                              }
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  "Processing"
                                )
                              }
                            >
                              {updatingOrder ===
                              order.id
                                ? "..."
                                : "Process"}
                            </button>

                          )}

                          {order.status ===
                            "Processing" && (

                            <button
                              className="action-btn complete-btn"
                              disabled={
                                updatingOrder ===
                                order.id
                              }
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  "Completed"
                                )
                              }
                            >
                              {updatingOrder ===
                              order.id
                                ? "..."
                                : "Complete"}
                            </button>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </>
        )}

        {/* ===================================
            PRODUCTS
        =================================== */}

        {activeSection === "products" && (
          <>

            <header className="admin-header">

              <div>

                <span className="header-eyebrow">
                  AJA BAKES MENU
                </span>

                <h1>Products</h1>

                <p>
                  Your current bakery products.
                </p>

              </div>

            </header>

            <section className="admin-product-showcase">

              {[
                {
                  name: "Classic Cinnamon Roll",
                  price: "₱55.00",
                  image:
                    "/products/cinnamon_regular.png",
                },
                {
                  name: "Cheese Cinnamon Roll",
                  price: "₱60.00",
                  image:
                    "/products/cinnamon_cheese.png",
                },
                {
                  name: "Oreo Cinnamon Roll",
                  price: "₱60.00",
                  image:
                    "/products/cinnamon_oreo.png",
                },
                {
                  name: "Almond Cinnamon Roll",
                  price: "₱65.00",
                  image:
                    "/products/cinnamon_almond.png",
                },
                {
                  name: "Biscoff Cinnamon Roll",
                  price: "₱70.00",
                  image:
                    "/products/cinnamon_biscoff.png",
                },
                {
                  name: "Chocolate Cinnamon Roll",
                  price: "₱70.00",
                  image:
                    "/products/cinnamon_chocolate.png",
                },
                {
                  name: "Garlic Cheese Bun",
                  price: "₱60.00",
                  image:
                    "/products/garlicbun.png",
                },
                {
                  name: "Waffle",
                  price: "₱10.00",
                  image:
                    "/products/waffles.png",
                },
              ].map((product) => (

                <div
                  className="admin-product-card"
                  key={product.name}
                >

                  <div className="admin-product-image">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  </div>

                  <div className="admin-product-info">

                    <h3>
                      {product.name}
                    </h3>

                    <strong>
                      {product.price}
                    </strong>

                  </div>

                </div>

              ))}

            </section>

          </>
        )}

      </main>

    </div>
  );
}