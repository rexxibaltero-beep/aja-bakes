import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import "./Orders.css";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrders =
      JSON.parse(
        localStorage.getItem("ajaCustomerOrders")
      ) || [];

    setOrders(savedOrders);
  }, []);

  const getPriceNumber = (price) => {
    return Number(
      price
        .replace("₱", "")
        .replace(",", "")
    );
  };

  const increaseQuantity = (id) => {
    const updatedOrders = orders.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    setOrders(updatedOrders);

    localStorage.setItem(
      "ajaCustomerOrders",
      JSON.stringify(updatedOrders)
    );
  };

  const decreaseQuantity = (id) => {
    const updatedOrders = orders
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    setOrders(updatedOrders);

    localStorage.setItem(
      "ajaCustomerOrders",
      JSON.stringify(updatedOrders)
    );
  };

  const removeOrder = (id) => {
    const updatedOrders = orders.filter(
      (item) => item.id !== id
    );

    setOrders(updatedOrders);

    localStorage.setItem(
      "ajaCustomerOrders",
      JSON.stringify(updatedOrders)
    );
  };

  const total = orders.reduce(
    (sum, item) =>
      sum +
      getPriceNumber(item.price) *
        item.quantity,
    0
  );

  return (
    <div className="aja-page">

      <Sidebar />

      <header className="navbar">
        <div className="nav-left">

          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
            className="navbar-logo"
          />

          <span className="nav-title">
            AJA BAKES
          </span>

        </div>
      </header>

      <main className="customer-orders-page">

        <div className="orders-title">

          <h1>YOUR ORDERS</h1>

          <p>
            Review your selected AJA Bakes
            products. 🤎
          </p>

        </div>

        {orders.length === 0 ? (

          <div className="no-orders">

            <div className="no-orders-icon">
              🛒
            </div>

            <h2>Your order is empty</h2>

            <p>
              Choose something delicious from
              our products.
            </p>

          </div>

        ) : (

          <>
            <div className="customer-orders-list">

              {orders.map((item) => (

                <div
                  className="customer-order-card"
                  key={item.id}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-product-image"
                  />

                  <div className="order-product-info">

                    <h3>{item.name}</h3>

                    <p>{item.price}</p>

                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <div className="order-item-right">

                    <strong>
                      ₱
                      {(
                        getPriceNumber(
                          item.price
                        ) * item.quantity
                      ).toFixed(2)}
                    </strong>

                    <button
                      className="remove-order-btn"
                      onClick={() =>
                        removeOrder(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="order-total-box">

              <div>
                <span>Total</span>

                <strong>
                  ₱{total.toFixed(2)}
                </strong>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
                >
                PROCEED TO ORDER
                </button>

            </div>
          </>
        )}

      </main>

    </div>
  );
}