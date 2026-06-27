import React, { useState } from "react";
import { useGetRecommendationsQuery } from "../store/apiSlice";
import Card from "../components/Card";
import { NavLink } from "react-router-dom";

const RecommendBooks = () => {
  const [generate, setGenerate] = useState(false);
  
  const { data: recommendations, isLoading, isError, isFetching } = useGetRecommendationsQuery(undefined, {
    skip: !generate,
  });

  const handleGenerate = () => {
    setGenerate(true);
  };

  return (
    <div className="recommend-books-page py-5" style={{ minHeight: "calc(100vh - 100px)", backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="fw-bold text-primary mb-3" style={{ fontSize: "3rem" }}>For You</h1>
          <p className="text-muted fs-5 mb-4">
            Discover books handpicked just for you based on your reading history and the preferences of readers with similar tastes!
          </p>
          {!generate && (
            <button 
              className="btn btn-submit btn-lg px-5 py-3 rounded-pill shadow"
              style={{ width: "auto", fontSize: "1.2rem" }}
              onClick={handleGenerate}
            >
              <i className="fa-solid fa-wand-magic-sparkles me-2"></i> Generate My Recommendations
            </button>
          )}
        </div>

        {generate && (
          <div className="recommendations-container mt-5">
            {(isLoading || isFetching) ? (
              <div className="text-center my-5 py-5">
                <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-4 text-muted">Analyzing millions of reading patterns...</h4>
              </div>
            ) : isError ? (
              <div className="alert alert-danger text-center shadow-sm">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                Failed to fetch recommendations. Please try again later.
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <>
                <div className="books-grid">
                  {recommendations.map((book) => (
                    <Card bookData={book} key={book._id} />
                  ))}
                </div>
                <div className="text-center mt-5">
                   <NavLink to="/books" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold">
                     Explore More Books
                   </NavLink>
                </div>
              </>
            ) : (
              <div className="text-center text-muted p-5 bg-white rounded shadow-sm">
                <h4>No recommendations available right now.</h4>
                <p>Start buying some books to let our algorithm learn what you like!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendBooks;
