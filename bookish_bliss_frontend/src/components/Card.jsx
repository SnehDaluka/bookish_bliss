import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCartItemsQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "../store/apiSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// import imgsrc from "../images/silent-patient.jpg";
const Card = (props) => {
  const src = props.bookData.imgsrc.startsWith('http') ? props.bookData.imgsrc : "/" + props.bookData.imgsrc;
  const href = `/book/${props.bookData._id}`;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const rating = props.bookData.rating || 0;
  let discount = props.bookData.discount;
  if (!discount && props.bookData.pprice > props.bookData.sprice) {
    discount = Math.round(((props.bookData.pprice - props.bookData.sprice) / props.bookData.pprice) * 100);
  } else if (!discount) {
    discount = 0;
  }

  const renderStars = (ratingValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (ratingValue >= i) {
        stars.push(<i key={i} className="fa-solid fa-star"></i>);
      } else if (ratingValue >= i - 0.5) {
        stars.push(<i key={i} className="fa-solid fa-star-half-stroke"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star"></i>);
      }
    }
    return stars;
  };

  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeCartItemMutation] = useRemoveCartItemMutation();

  const { data: cartItems = [] } = useGetCartItemsQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  const cartItem = cartItems.find((item) => item.bookname === props.bookData.name);

  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  const inWishlist = wishlistItems.some(item => item.book._id === props.bookData._id || item.book === props.bookData._id);

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(props.bookData._id).unwrap();
      } else {
        await addToWishlist({ _id: props.bookData._id }).unwrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (e) => {
    try {
      await addToCartMutation({ _id: props.bookData._id }).unwrap();
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
        console.error("Server error");
      }
    }
  };

  const handleIncrease = async () => {
    try {
      await updateCartItemMutation({ name: props.bookData.name, quantity: cartItem.quantity + 1 }).unwrap();
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
      if (cartItem.quantity === 1) {
        await removeCartItemMutation(props.bookData.name).unwrap();
      } else {
        await updateCartItemMutation({ name: props.bookData.name, quantity: cartItem.quantity - 1 }).unwrap();
      }
    } catch (error) {
      console.log("Server error", error);
    }
  };

  return (
    <div className="book-card">
      <div className="book-card-image" style={{ position: 'relative' }}>
        {discount > 0 && (
          <span className="discount-badge">{discount}% OFF</span>
        )}
        <button 
          className="wishlist-overlay-btn shadow-sm" 
          onClick={handleWishlistToggle}
          title={props.isWishlistPage ? "Remove from Wishlist" : (inWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {props.isWishlistPage ? (
            <i className="fa-solid fa-trash-can text-danger" style={{ fontSize: '1.1rem' }}></i>
          ) : (
            <i className={inWishlist ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart text-secondary"} style={{ fontSize: '1.1rem' }}></i>
          )}
        </button>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={src} alt={props.bookData.name} />
        </a>
      </div>
      <div className="book-card-content">
        <div className="book-card-header">
          <h3 className="book-card-title">
            <a href={href} target="_blank" rel="noreferrer">
              {props.bookData.name}
            </a>
          </h3>
          <p className="book-card-author">by {props.bookData.author}</p>
          <div className="book-card-rating">
            {renderStars(rating)} <span className="ms-1 text-muted small">({rating})</span>
          </div>
        </div>
        <div className="book-card-price">
          <span className="selling-price">Rs {props.bookData.sprice}.00</span>
          {props.bookData.pprice > props.bookData.sprice && (
            <span className="original-price">Rs {props.bookData.pprice}.00</span>
          )}
        </div>
        {cartItem ? (
          <div className="quantity-control">
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
        ) : (
          <button
            className="btn book-card-btn"
            onClick={handleClick}
          >
            <><i className="fa-solid fa-cart-plus me-2"></i> Add to Cart</>
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
