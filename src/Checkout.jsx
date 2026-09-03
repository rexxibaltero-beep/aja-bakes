import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Checkout() {
  const navigate = useNavigate();

  const [orders] = useState(
    JSON.parse(localStorage.getItem("ajaCustomerOrders")) || []
  );

  const [form, setForm] = useState({
    name: "",
    contact: "",
    method: "Pickup",
    address: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getPriceNumber = (price) => {
    return Number(price.replace("₱", "").replace(",", ""));
  };

  const total = orders.reduce(
    (sum, item) =>
      sum +
      getPriceNumber(item.price) * item.quantity,
    0
  );

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (orders.length === 0) {
    alert("Your order is empty.");
    navigate("/products");
    return;
  }

  try {
    const newOrder = {
      customerName: form.name,
      contactNumber: form.contact,
      orderMethod: form.method,
      address: form.address,
      preferredDate: form.date,
      preferredTime: form.time,
      notes: form.notes,

      products: orders,

      total: total,
      status: "Pending",

      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "orders"), newOrder);

    localStorage.removeItem("ajaCustomerOrders");

    alert("Your order has been placed successfully! 🤎");

    navigate("/orders");
  } catch (error) {
    console.error("Error placing order:", error);

    alert(
      "Something went wrong while placing your order. Please try again."
    );
  }
};

  return (
    <div className="checkout-page">

      <div className="checkout-container">

        <div className="checkout-header">

          <img
            src="/logo.png"
            alt="AJA Bakes"
          />

          <h1>CHECKOUT</h1>

          <p>
            Complete your information to place
            your order. 🤎
          </p>

        </div>

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >

          {/* CUSTOMER INFORMATION */}

          <section className="checkout-section">

            <h2>Customer Information</h2>

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>
                Contact Number
              </label>

              <input
                type="tel"
                name="contact"
                placeholder="09XXXXXXXXX"
                value={form.contact}
                onChange={handleChange}
                required
              />

            </div>

          </section>


          {/* PICKUP / DELIVERY */}

          <section className="checkout-section">

            <h2>Order Method</h2>

            <div className="method-options">

              <label className="method-option">

                <input
                  type="radio"
                  name="method"
                  value="Pickup"
                  checked={form.method === "Pickup"}
                  onChange={handleChange}
                />

                <span>
                  📍 Pickup
                </span>

              </label>


              <label className="method-option">

                <input
                  type="radio"
                  name="method"
                  value="Delivery"
                  checked={form.method === "Delivery"}
                  onChange={handleChange}
                />

                <span>
                  🛵 Delivery
                </span>

              </label>

            </div>

            {form.method === "Delivery" && (

              <div className="form-group">

                <label>
                  Delivery Address
                </label>

                <textarea
                  name="address"
                  placeholder="Enter your complete address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

              </div>

            )}

          </section>


          {/* DATE AND TIME */}

          <section className="checkout-section">

            <h2>Schedule</h2>

            <div className="schedule-row">

              <div className="form-group">

                <label>
                  Preferred Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Preferred Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

          </section>


          {/* NOTES */}

          <section className="checkout-section">

            <h2>Special Instructions</h2>

            <textarea
              name="notes"
              placeholder="Optional: Add any special instructions..."
              value={form.notes}
              onChange={handleChange}
            />

          </section>


          {/* ORDER SUMMARY */}

          <section className="checkout-summary">

            <h2>Order Summary</h2>

            {orders.map((item) => (

              <div
                className="checkout-item"
                key={item.id}
              >

                <span>
                  {item.name} × {item.quantity}
                </span>

                <strong>
                  ₱
                  {(
                    getPriceNumber(item.price) *
                    item.quantity
                  ).toFixed(2)}
                </strong>

              </div>

            ))}

            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                ₱{total.toFixed(2)}
              </strong>

            </div>

          </section>


          <button
            type="submit"
            className="place-order-btn"
          >
            PLACE ORDER
          </button>


          <button
            type="button"
            className="back-orders-btn"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>

        </form>

      </div>

    </div>
  );
}