import React, { useEffect } from "react";
import NotFound from "../components/NotFound";
import BooksCart from "../components/BooksCart";
import { useNavigate } from "react-router-dom";
import { useGetCartItemsQuery, usePlaceOrderMutation } from "../store/apiSlice";
import Swal from "sweetalert2";

const Cart = (props) => {
  const navigate = useNavigate();

  const { data: bookNames = [], isLoading } = useGetCartItemsQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });

  const totalAmount = bookNames.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
  const totalOriginalAmount = bookNames.reduce((acc, item) => acc + ((item.originalPrice || item.price || 0) * item.quantity), 0);
  const totalDiscount = totalOriginalAmount - totalAmount;

  const [placeOrderMutation] = usePlaceOrderMutation();

  const handleClick = async () => {
    if (props.pageName === "order-details") {
      try {
        await placeOrderMutation().unwrap();
        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: "Your order has been successfully placed.",
          confirmButtonColor: "#ff6200",
        }).then(() => {
          navigate("/");
        });
      } catch (error) {
        console.error("Server error");
      }
    } else {
      navigate("/cart/orderdetails");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <div className="container py-5 cart-page">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="cart-page-title">
            {props.pageName === "order-details" ? "Checkout" : "Your Cart"}
          </h1>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8 col-12">
          <div className="cart-items-container">
            {isLoading ? (
              <div className="text-center w-100 my-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : bookNames.length ? (
              bookNames.map((item, index) => (
                <BooksCart book={item} page_details={props.pageName} key={index} />
              ))
            ) : (
              <NotFound message="Your cart is empty!" img="2" />
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-lg-4 col-12">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <hr />
            <div className="summary-row">
              <span>Subtotal ({bookNames.length} items)</span>
              <span>Rs {totalOriginalAmount}.00</span>
            </div>
            {totalDiscount > 0 && (
              <div className="summary-row">
                <span>Discount</span>
                <span className="text-success">- Rs {totalDiscount}.00</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>
            <hr />
            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span>Rs {totalAmount}.00</span>
            </div>
            <button
              className="btn btn-submit mt-4 w-100"
              disabled={bookNames.length === 0}
              onClick={handleClick}
            >
              {props.pageName === "order-details" ? "Confirm Order" : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
