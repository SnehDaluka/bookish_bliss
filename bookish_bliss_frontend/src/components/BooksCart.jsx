import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetBookByNameQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useAddToWishlistMutation,
} from "../store/apiSlice";
import Swal from "sweetalert2";

const BooksCart = (props) => {
  const quantity = props.book.quantity;

  const { data: bookDetails } = useGetBookByNameQuery(props.book.bookname, {
    skip: !props.book.bookname,
  });
  const bookData = bookDetails ? bookDetails[0] : {};
  const href = bookData._id ? "/book/" + bookData._id : "#";
  const imgSrc = bookData.imgsrc ? (bookData.imgsrc.startsWith('http') ? bookData.imgsrc : "/" + bookData.imgsrc) : "";

  const rating = bookData.rating || 0;
  let discount = bookData.discount;
  if (!discount && bookData.pprice > bookData.sprice) {
    discount = Math.round(((bookData.pprice - bookData.sprice) / bookData.pprice) * 100);
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

  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeCartItemMutation] = useRemoveCartItemMutation();
  const [addToWishlistMutation] = useAddToWishlistMutation();

  // Flawed manual amount synchronization removed from here

  const addQuantity = async () => {
    try {
      await updateCartItemMutation({
        name: props.book.bookname,
        quantity: quantity + 1,
      }).unwrap();
    } catch (error) {
      if (error.status === 400 && error.data?.message) {
        Swal.fire({
          icon: 'warning',
          title: 'Limit Reached',
          text: error.data.message,
          confirmButtonColor: '#ff6200'
        });
      } else {
        console.error("Server Error");
      }
    }
  };

  const subQuantity = async () => {
    try {
      await updateCartItemMutation({
        name: props.book.bookname,
        quantity: quantity - 1,
      }).unwrap();
    } catch (error) {
      console.error("Server Error");
    }
  };

  const removeItem = async () => {
    try {
      const result = await Swal.fire({
        title: 'Remove Item?',
        text: "Are you sure you want to remove this book from your cart?",
        icon: 'warning',
        showCancelButton: false,
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonColor: '#ffffff',
        denyButtonColor: '#ff6200',
        confirmButtonText: '<span style="color: #dc3545;">Remove</span>',
        denyButtonText: 'Move to Wishlist'
      });

      if (result.isConfirmed) {
        await removeCartItemMutation(props.book.bookname).unwrap();
        Swal.fire({
          title: 'Removed!',
          text: 'The book has been removed from your cart.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else if (result.isDenied) {
        if (props.book._id) {
          await addToWishlistMutation({ _id: props.book._id }).unwrap();
        }
        await removeCartItemMutation(props.book.bookname).unwrap();
        Swal.fire({
          title: 'Moved!',
          text: 'The book has been moved to your wishlist.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Server error", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to remove item.',
        confirmButtonColor: '#ff6200'
      });
    }
  };
  return (
    <div className="cart-item-row">
      <div className="cart-item-image">
        {discount > 0 && (
          <span className="discount-badge">{discount}% OFF</span>
        )}
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={imgSrc} alt={bookData.name} />
        </a>
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <h3 className="cart-item-title">
            <a href={href} target="_blank" rel="noopener noreferrer">
              {bookData.name}
            </a>
          </h3>
          <p className="cart-item-author">by {bookData.author}</p>
          <div className="cart-item-rating">
            {renderStars(rating)} <span className="ms-1 text-muted small">({rating})</span>
          </div>
        </div>

        <div className="cart-item-price">
          <span className="selling-price">Rs {bookData.sprice}.00</span>
          {bookData.pprice > bookData.sprice && (
            <span className="original-price">Rs {bookData.pprice}.00</span>
          )}
        </div>
      </div>

      <div className="cart-item-actions">
        {props.page_details === "order-details" ? (
          <div className="cart-item-static-qty">Qty: {quantity}</div>
        ) : (
          <div className="cart-item-controls">
            <div className="quantity-control cart-qty-override">
              <button className="btn btn-qty" disabled={quantity <= 1} onClick={subQuantity}>
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="qty-number">{quantity}</span>
              <button className="btn btn-qty" onClick={addQuantity}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            <button className="btn btn-remove" onClick={removeItem} title="Remove item">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default BooksCart;
