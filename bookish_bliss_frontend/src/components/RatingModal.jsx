import React, { useState } from "react";
import { useRateBookMutation } from "../store/apiSlice";

const RatingModal = ({ show, onClose, bookId, bookName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rateBook, { isLoading, isSuccess, isError, error }] = useRateBookMutation();

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await rateBook({ id: bookId, bookName, rating }).unwrap();
      setTimeout(() => {
        onClose();
        setRating(0); // reset
      }, 1500);
    } catch (err) {
      console.error("Failed to rate:", err);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
      <div className="bg-white p-4 rounded shadow-lg text-center position-relative" style={{ maxWidth: '400px', width: '90%' }}>
        
        {/* Close Button */}
        <button 
          className="btn-close position-absolute top-0 end-0 m-3" 
          onClick={() => {
            onClose();
            setRating(0);
          }}
          disabled={isLoading}
        ></button>

        <h3 className="mb-2 fw-bold" style={{ color: '#2c3e50' }}>Rate Book</h3>
        <p className="text-muted small mb-4">How did you like <strong className="text-capitalize">{bookName}</strong>?</p>

        {isSuccess ? (
          <div className="alert alert-success py-2">
            <i className="fa-solid fa-circle-check me-2"></i>
            Thank you for your rating!
          </div>
        ) : (
          <>
            <div className="stars-container mb-4 d-flex justify-content-center gap-2 fs-2" style={{ color: '#f39c12', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-star ${star <= (hoverRating || rating) ? 'fa-solid' : 'fa-regular'}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{ transition: 'transform 0.1s' }}
                ></i>
              ))}
            </div>

            {isError && (
              <p className="text-danger small mb-3">{error?.data?.message || "Failed to submit rating."}</p>
            )}

            <button 
              className="btn w-100 fw-bold text-white rounded-pill py-2" 
              style={{ backgroundColor: '#2c3e50', transition: 'background-color 0.2s' }}
              onClick={handleSubmit}
              disabled={rating === 0 || isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                "Submit Rating"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
