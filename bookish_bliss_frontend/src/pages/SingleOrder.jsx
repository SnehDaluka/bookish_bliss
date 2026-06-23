import React, { useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useGetOrderByIdQuery } from "../store/apiSlice";

const SingleOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id, {
    skip: !localStorage.getItem("isLoggedIn"),
  });

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

  if (isError || !order) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <h2 className="mt-5 text-danger">Order Not Found</h2>
        <p>We couldn't find the details for this order.</p>
        <NavLink to="/orders" className="btn btn-dark mt-3">Back to My Orders</NavLink>
      </div>
    );
  }

  return (
    <div className="single-order-page">
      <div className="container py-5">
        <div className="mb-4">
          <NavLink to="/orders" className="back-link">
            <i className="fa-solid fa-arrow-left me-2"></i> Back to Orders
          </NavLink>
        </div>

        <div className="row g-4">
          {/* Main Details */}
          <div className="col-lg-8">
            <div className="order-details-card mb-4">
              <div className="card-header bg-dark text-white p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <h2 className="mb-1">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
                    <p className="mb-0 opacity-75">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="status-badge bg-white text-dark fw-bold px-3 py-2 rounded-pill mt-3 mt-md-0">
                    <i className="fa-solid fa-circle-check text-success me-2"></i>
                    {order.status}
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div className="order-item d-flex p-4 border-bottom align-items-center" key={index}>
                      {item.imgsrc ? (
                        <img src={item.imgsrc.startsWith('http') ? item.imgsrc : `/images/${item.imgsrc}`} alt={item.bookname} className="item-thumbnail rounded shadow-sm me-4" style={{ width: '80px', height: '110px', objectFit: 'cover' }} />
                      ) : (
                        <div className="item-thumbnail bg-light rounded d-flex align-items-center justify-content-center me-4" style={{ width: '80px', height: '110px' }}>
                          <i className="fa-solid fa-book text-muted fs-3"></i>
                        </div>
                      )}
                      <div className="item-info flex-grow-1">
                        <h4 className="mb-1 text-dark fw-bold text-capitalize">{item.bookname}</h4>
                        <p className="text-muted mb-0">Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price text-end">
                        <span className="d-block text-muted text-decoration-line-through small">
                          Rs {((item.price + (order.totalDiscount / order.items.length)) * item.quantity).toFixed(2)}
                        </span>
                        <h5 className="mb-0 fw-bold">Rs {item.price * item.quantity}.00</h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="col-lg-4">
            <div className="order-summary-sidebar bg-white p-4 rounded shadow-sm border">
              <h3 className="fw-bold mb-4 border-bottom pb-3">Payment Summary</h3>
              
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Subtotal ({order.items.length} items)</span>
                <span>Rs {order.totalAmount + order.totalDiscount}.00</span>
              </div>
              
              {order.totalDiscount > 0 && (
                <div className="d-flex justify-content-between mb-3">
                  <span>Discount</span>
                  <span className="text-success fw-bold">- Rs {order.totalDiscount}.00</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-4 text-muted border-bottom pb-4">
                <span>Shipping</span>
                <span className="text-success fw-bold">Free</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">Total Paid</span>
                <span className="fw-bold fs-4 text-dark">Rs {order.totalAmount}.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrder;
