import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useGetOrdersQuery, useGetUserRatingsQuery } from "../store/apiSlice";
import RatingModal from "../components/RatingModal";

const Orders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrdersQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  const { data: userRatings = {} } = useGetUserRatingsQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });

  const [ratingModal, setRatingModal] = useState(false);
  const [ratingBook, setRatingBook] = useState({ id: null, name: "" });

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View and track your previous purchases</p>
        </div>

        <div className="orders-container">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <i className="fa-solid fa-box-open"></i>
              <h3>No Orders Yet</h3>
              <p>Looks like you haven't made any purchases with us.</p>
              <NavLink to="/books" className="btn btn-shop">
                Explore Books
              </NavLink>
            </div>
          ) : (
            orders.map((order) => (
              <div className="order-card-v2" key={order._id}>
                {/* Header (4 Columns) */}
                <div className="order-header-v2">
                  <div className="header-col">
                    <span className="label">Order Number</span>
                    <span className="value">#{order._id.substring(order._id.length - 10).toUpperCase()}</span>
                  </div>
                  <div className="header-col">
                    <span className="label">Order Date</span>
                    <span className="value">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="header-col">
                    <span className="label">Status</span>
                    <span className="value">{order.status}</span>
                  </div>
                  <div className="header-col border-0">
                    <span className="label">Ship To</span>
                    <span className="value">Digital Library</span>
                  </div>
                </div>

                {/* Body (Item List) */}
                <div className="order-body-v2">
                  {order.items.map((item, index) => (
                    <div className="order-item-v2" key={index}>
                      <div className="item-image-wrapper">
                        {item.imgsrc ? (
                          <img src={item.imgsrc.startsWith('http') ? item.imgsrc : `/images/${item.imgsrc}`} alt={item.bookname} />
                        ) : (
                          <div className="placeholder-image">
                            <i className="fa-solid fa-book"></i>
                          </div>
                        )}
                      </div>
                      
                      <div className="item-details-v2">
                        <div className="title-row">
                          <h5 className="text-capitalize">{item.bookname}</h5>
                          <span className="price">Rs {item.price * item.quantity}.00</span>
                        </div>
                        <div className="meta-row">
                          <p>Quantity: {item.quantity}</p>
                          <p>Format: Hardcover</p>
                        </div>
                        
                        {userRatings[item.bookId] || userRatings[item.bookname] ? (
                          <div className="d-flex align-items-center gap-1 mt-2" style={{ color: '#f39c12', fontSize: '0.95rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <i 
                                key={star} 
                                className={`fa-star ${star <= (userRatings[item.bookId] || userRatings[item.bookname]) ? 'fa-solid' : 'fa-regular'}`}
                              ></i>
                            ))}
                          </div>
                        ) : (
                          <button 
                            className="btn-rate-now"
                            onClick={() => {
                              setRatingBook({ id: item.bookId, name: item.bookname });
                              setRatingModal(true);
                            }}
                          >
                            <i className="fa-solid fa-star"></i> Rate Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-footer-v2">
                  <div className="total-amount-v2">
                    <span className="label">Total Amount : </span>
                    <span className="value">Rs {order.totalAmount}.00</span>
                  </div>
                  <NavLink to={`/orders/${order._id}`} className="btn-invoice">
                    View Details <i className="fa-solid fa-arrow-right ms-1"></i>
                  </NavLink>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <RatingModal 
        show={ratingModal} 
        onClose={() => setRatingModal(false)} 
        bookId={ratingBook.id} 
        bookName={ratingBook.name} 
      />
    </div>
  );
};

export default Orders;
