import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import BookDetails from "./pages/BookDetails";
import OrderDetails from "./pages/OrderDetails";
import OrderPlaced from "./components/OrderPlaced";
import Orders from "./pages/Orders";
import SingleOrder from "./pages/SingleOrder";
import Wishlist from "./pages/Wishlist";
import RequestBook from "./pages/RequestBook";
import RecommendBooks from "./pages/RecommendBooks";

function App() {
  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="main-content flex-grow-1 d-flex flex-column">
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index element={<Home />} />
            <Route path="/books" element={<Books pathName="home" />} />
            <Route path="/books/search" element={<Books pathName="search" />} />
            <Route
              path="/books/:category"
              element={<Books pathName="category" />}
            />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/request-book" element={<RequestBook />} />
            <Route path="/recommendations" element={<RecommendBooks />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart/orderdetails" element={<OrderDetails />} />
            <Route path="/orderplaced" element={<OrderPlaced />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<SingleOrder />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
