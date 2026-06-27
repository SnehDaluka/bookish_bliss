import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useGetBookDetailsQuery,
  useGetCartItemsQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../store/apiSlice";
import Swal from "sweetalert2";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: bookDetailsData, isLoading: loadingDetails } = useGetBookDetailsQuery(id);
  const data = bookDetailsData && bookDetailsData.length > 0 ? bookDetailsData[0] : null;
  const src = data?.imgsrc ? (data.imgsrc.startsWith('http') ? data.imgsrc : "/" + data.imgsrc) : "";

  let discount = data?.discount || 0;
  if (!discount && data?.pprice > data?.sprice) {
    discount = Math.round(((data.pprice - data.sprice) / data.pprice) * 100);
  }

  // Calculate Rating Distribution
  const reviews = data?.reviews || [];
  const totalReviews = reviews.length;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    if (ratingCounts[review.rating] !== undefined) {
      ratingCounts[review.rating]++;
    }
  });

  const getPercent = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const { data: cartItems = [] } = useGetCartItemsQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });
  const cartItem = data?.name ? cartItems.find((item) => item.bookname === data.name) : null;
  const addedToCart = !!cartItem;

  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeCartItemMutation] = useRemoveCartItemMutation();
  const [activeTab, setActiveTab] = useState('description');

  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  const inWishlist = data?._id ? wishlistItems.some(item => item.book._id === data._id || item.book === data._id) : false;

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(data._id).unwrap();
      } else {
        await addToWishlist({ _id: data._id }).unwrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async () => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
      return false;
    }
    try {
      if (!data?._id) return false;
      await addToCartMutation({ _id: data._id }).unwrap();
      return true;
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
      } else if (error.status === 400 && error.data?.message) {
        Swal.fire({
          icon: 'warning',
          title: 'Limit Reached',
          text: error.data.message,
          confirmButtonColor: '#ff6200'
        });
      } else {
        console.error("Server Error");
      }
      return false;
    }
  };

  const handleClick1 = async () => {
    await addToCart();
  };

  const handleClick2 = async () => {
    const success = await addToCart();
    if (success) {
      navigate("/cart");
    }
  };

  const handleIncrease = async () => {
    try {
      if (!cartItem) return;
      await updateCartItemMutation({ name: data.name, quantity: cartItem.quantity + 1 }).unwrap();
    } catch (error) {
      if (error.status === 400 && error.data?.message) {
        Swal.fire({
          icon: 'warning',
          title: 'Limit Reached',
          text: error.data.message,
          confirmButtonColor: '#ff6200'
        });
      } else {
        console.error("Server error", error);
      }
    }
  };

  const handleDecrease = async () => {
    try {
      if (!cartItem) return;
      if (cartItem.quantity === 1) {
        await removeCartItemMutation(data.name).unwrap();
      } else {
        await updateCartItemMutation({ name: data.name, quantity: cartItem.quantity - 1 }).unwrap();
      }
    } catch (error) {
      console.error("Server error", error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeCartItemMutation(data.name).unwrap();
    } catch (error) {
      console.error("Server error", error);
    }
  };

  if (loadingDetails) {
    return (
      <div className="container-fluid book-details-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return [1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={`fa-star ${star <= numRating ? 'fa-solid' : 'fa-regular'}`}></i>
    ));
  };

  return (
    <div className="container-fluid book-details-page my-3 px-lg-5">
      <div className="row">
        {/* Left Column: Image */}
        <div className="col-lg-4 col-12 mb-4 mb-lg-0">
          <div className="book-image-container">
            <button
              className="wishlist-overlay-btn shadow-sm"
              onClick={handleWishlistToggle}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <i className={inWishlist ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart text-secondary"} style={{ fontSize: '1.2rem' }}></i>
            </button>
            <img src={src} className="img-fluid" alt={data.name} />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="col-lg-8 col-12 book-info">
          <div className="badges">
            {Array.isArray(data.category)
              ? data.category.map(cat => (
                <span key={cat} className="badge bg-dark text-white text-capitalize me-2">{cat}</span>
              ))
              : <span className="badge bg-dark text-white text-capitalize me-2">{data.category}</span>
            }
            {data.qty > 0 ? (
              <span className="badge bg-success">In Stock</span>
            ) : (
              <span className="badge bg-danger">Out of Stock</span>
            )}
          </div>

          <h1>{data.name}</h1>
          <p className="author-name">by {data.author}</p>

          <div className="rating-stars">
            {renderStars(data.rating)}
            <span className="rating-value">{data.rating > 0 ? data.rating : "0.0"}</span>
          </div>

          {/* Action Card */}
          <div className="action-card">
            <div className="price-section">
              <span className="current-price">Rs {data.sprice}.00</span>
              <div className="mrp-section">
                {data.pprice > data.sprice && (
                  <span className="original-price">MRP: Rs {data.pprice}.00</span>
                )}
                {discount > 0 && (
                  <span className="discount-text">({discount}% OFF)</span>
                )}
              </div>
            </div>

            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                {cartItem ? (
                  <div className="cart-management w-100">
                    <div className="quantity-control w-100">
                      <button className="btn btn-qty" onClick={handleDecrease}>
                        {cartItem.quantity === 1 ? (
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        ) : (
                          <i className="fa-solid fa-minus"></i>
                        )}
                      </button>
                      <span className="qty-number">{cartItem.quantity}</span>
                      <button className="btn btn-qty" onClick={handleIncrease}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-submit w-100"
                    onClick={handleClick1}
                    disabled={data.qty <= 0}
                  >
                    <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                  </button>
                )}
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                <button
                  className="btn btn-submit flex-grow-1"
                  onClick={handleClick2}
                  disabled={data.qty <= 0}
                >
                  <i className="fa-solid fa-bolt"></i> Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Tabbed Info */}
          <div className="details-tabs">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  About the Book
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'author' ? 'active' : ''}`}
                  onClick={() => setActiveTab('author')}
                >
                  About the Author
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'publisher' ? 'active' : ''}`}
                  onClick={() => setActiveTab('publisher')}
                >
                  Publisher Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
              </li>
            </ul>

            <div className="tab-content mt-3">
              {activeTab === 'description' && (
                <div className="tab-pane active fade show">
                  <p>{data.description}</p>
                </div>
              )}
              {activeTab === 'author' && (
                <div className="tab-pane active fade show">
                  <p>{data.authordetails}</p>
                </div>
              )}
              {activeTab === 'publisher' && (
                <div className="tab-pane active fade show">
                  <p><strong>Published by:</strong> {data.publisher}</p>
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="tab-pane active fade show">
                  <table className="table table-bordered mt-2" style={{ maxWidth: '400px' }}>
                    <tbody>
                      {data.subtitle && <tr><th className="bg-light w-50">Subtitle</th><td>{data.subtitle}</td></tr>}
                      {data.pageCount && <tr><th className="bg-light">Page Count</th><td>{data.pageCount} pages</td></tr>}
                      {data.publicationDate && <tr><th className="bg-light">Published Year</th><td>{data.publicationDate}</td></tr>}
                      {data.isbn13 && <tr><th className="bg-light">ISBN-13</th><td>{data.isbn13}</td></tr>}
                      {data.isbn10 && <tr><th className="bg-light">ISBN-10</th><td>{data.isbn10}</td></tr>}
                      {data.language && <tr><th className="bg-light">Language</th><td className="text-uppercase">{data.language}</td></tr>}
                      {!data.pageCount && !data.isbn13 && !data.language && <tr><td colSpan="2" className="text-muted text-center">No additional specifications available.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Ratings Breakdown Section */}
          <div className="ratings-breakdown-section mt-5">
            <h3 className="section-title text-uppercase fw-bold mb-4" style={{ color: '#2c3e50', fontSize: '1.2rem', letterSpacing: '1px' }}>
              RATINGS <i className="fa-regular fa-star ms-1"></i>
            </h3>

            <div className="ratings-container">
              <div className="ratings-left">
                <div className="average-rating">
                  <span className="avg-number">{data.rating > 0 ? parseFloat(data.rating).toFixed(1) : "0.0"}</span>
                  <i className="fa-solid fa-star avg-star"></i>
                </div>
                <p className="verified-buyers">{totalReviews} Verified Buyers</p>
              </div>

              <div className="ratings-right">
                {[5, 4, 3, 2, 1].map(star => (
                  <div className="rating-bar-row" key={star}>
                    <span className="star-label">{star} <i className="fa-solid fa-star"></i></span>
                    <div className="progress-bar-container">
                      <div className={`progress-bar-fill star-${star}`} style={{ width: `${getPercent(ratingCounts[star])}%` }}></div>
                    </div>
                    <span className="star-count">{ratingCounts[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookDetails;
