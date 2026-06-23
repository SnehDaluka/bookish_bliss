import React from "react";
import { useGetWishlistQuery } from "../store/apiSlice";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

const Wishlist = () => {
  const navigate = useNavigate();
  const { data: wishlistItems = [], isLoading } = useGetWishlistQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });

  if (!localStorage.getItem("isLoggedIn")) {
    return (
      <div className="container text-center py-5 mt-5">
        <h2>Please Log In</h2>
        <p className="text-muted">You need to be logged in to view your wishlist.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5 min-vh-100">
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <i className="fa-solid fa-heart text-danger fs-3 me-3"></i>
        <h2 className="mb-0 fw-bold" style={{ color: "#2c3e50" }}>My Wishlist</h2>
        <span className="badge bg-danger ms-3 fs-6 rounded-pill">
          {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5 mt-4">
          <div className="mb-4">
            <i className="fa-regular fa-heart text-muted" style={{ fontSize: "5rem", opacity: 0.2 }}></i>
          </div>
          <h3 className="text-muted mb-3">Your wishlist is empty</h3>
          <p className="text-muted mb-4">Explore our collection and find books you love!</p>
          <button className="btn btn-primary px-4 py-2" onClick={() => navigate("/books")} style={{ backgroundColor: "#ff6200", borderColor: "#ff6200" }}>
            Explore Books
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {wishlistItems.map((item) => (
            <Card bookData={item.book} isWishlistPage={true} key={item.book._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
