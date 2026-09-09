
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Products from "./Products";
import About from "./About";
import PickUpDelivery from "./PickUpDelivery";
import Contact from "./Contact";

import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

import CustomerLogin from "./CustomerLogin";
import Register from "./Register";
import CustomerAccount from "./CustomerAccount";

import Orders from "./Orders";
import Checkout from "./Checkout";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={<Products />}
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* PICKUP & DELIVERY */}
        <Route
          path="/pickup-delivery"
          element={<PickUpDelivery />}
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={<Admin />}
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={<Orders />}
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* CUSTOMER LOGIN */}
        <Route
          path="/login"
          element={<CustomerLogin />}
        />

        {/* CUSTOMER REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* CUSTOMER ACCOUNT */}
        <Route
          path="/account"
          element={<CustomerAccount />}
        />

      </Routes>

    </BrowserRouter>
  );
}
