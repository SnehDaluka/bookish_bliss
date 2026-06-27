import React, { useEffect, useState } from "react";
import CategoryOptions from "../components/CategoryOptions";
import Card from "../components/Card";
import imgsrc from "../images/books-logo.jpg";
import { useDispatch } from "react-redux";
// import { login } from "../store/slice";
import { useParams, useSearchParams } from "react-router-dom";
import NotFound from "../components/NotFound";
import {
  useGetBooksQuery,
  useGetBooksByCategoryQuery,
  useSearchBooksQuery,
} from "../store/apiSlice";

const Books = (props) => {
  // const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { category } = useParams();
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("recommended");

  const sortOptionsMap = {
    'recommended': 'Recommended',
    'price_asc': 'Price: Low to High',
    'price_desc': 'Price: High to Low',
    'rating_desc': 'Top Rated',
    'name_asc': 'A - Z'
  };

  // Reset page to 1 when category, search, or sort changes
  useEffect(() => {
    setPage(1);
  }, [category, searchParams.get("name"), sortOption]);

  const { data: allBooks, isLoading: loadingAll } = useGetBooksQuery({ page, sort: sortOption }, {
    skip: props.pathName !== "home",
  });

  const { data: categoryBooks, isLoading: loadingCategory } = useGetBooksByCategoryQuery({ category, page, sort: sortOption }, {
    skip: props.pathName !== "category",
  });

  const { data: searchBooks, isLoading: loadingSearch } = useSearchBooksQuery({ name: searchParams.get("name"), page, sort: sortOption }, {
    skip: props.pathName !== "search",
  });

  const booksData =
    props.pathName === "home"
      ? allBooks
      : props.pathName === "category"
      ? categoryBooks
      : searchBooks;

  const isLoading = loadingAll || loadingCategory || loadingSearch;
  return (
    <div className="books-page-wrapper">
      <div className="container-fluid p-0">
        <div className="explore-hero">
          <h1>Explore Our Collection</h1>
          <p>Find your next great read across {category ? `the ${category}` : "all"} categories</p>
        </div>
      </div>

      <div className="container px-lg-5">
        <div className="mobile-filter-bar">
          <h2 className="category-label">Category: <span className="text-primary text-capitalize">{category || "All"}</span></h2>
          <div className="d-flex align-items-center gap-2">
            <div className="dropdown d-lg-none">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Sort: {sortOptionsMap[sortOption]}
              </button>
              <ul className="dropdown-menu shadow-sm">
                {Object.entries(sortOptionsMap).map(([key, label]) => (
                  <li key={key}>
                    <button 
                      className={`dropdown-item ${sortOption === key ? 'active' : ''}`} 
                      onClick={() => setSortOption(key)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="btn-filter"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasResponsive"
              aria-controls="offcanvasResponsive"
            >
              <i className="fa-solid fa-filter"></i> Filter
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="sidebar-wrapper">
              <CategoryOptions />
            </div>
          </div>
          
          <div className="col-lg-9 books-list">
            <div className="d-none d-lg-flex justify-content-between align-items-center mb-4">
              <h2 className="fs-5 fw-bold mb-0 text-muted">Browsing: <span className="text-primary text-capitalize">{category || "All Categories"}</span></h2>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-muted small">Sort by:</span>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ minWidth: '170px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    {sortOptionsMap[sortOption]}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    {Object.entries(sortOptionsMap).map(([key, label]) => (
                      <li key={key}>
                        <button 
                          className={`dropdown-item ${sortOption === key ? 'active' : ''}`} 
                          onClick={() => setSortOption(key)}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center w-100 my-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : booksData && booksData.books && booksData.books.length ? (
              <>
                <div className="books-grid">
                  {booksData.books.map((item) => {
                    return <Card bookData={item} key={item._id} />;
                  })}
                </div>
                
                {/* Pagination Controls */}
                {booksData.totalPages > 1 && (
                  <div className="custom-pagination">
                    <button 
                      className="page-nav prev"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={booksData.currentPage === 1}
                    >
                      PREVIOUS
                    </button>
                    
                    <div className="page-numbers d-none d-sm-flex">
                      {Array.from({ length: Math.min(10, booksData.totalPages) }, (_, i) => {
                        // Logic to center the current page among 10 visible pages
                        let start = Math.max(1, booksData.currentPage - 4);
                        let end = Math.min(booksData.totalPages, start + 9);
                        if (end - start < 9) {
                          start = Math.max(1, end - 9);
                        }
                        const pageNum = start + i;
                        if (pageNum > booksData.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-num ${booksData.currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="page-numbers d-flex d-sm-none">
                      {Array.from({ length: Math.min(5, booksData.totalPages) }, (_, i) => {
                        // Show fewer pages on mobile
                        let start = Math.max(1, booksData.currentPage - 2);
                        let end = Math.min(booksData.totalPages, start + 4);
                        if (end - start < 4) {
                          start = Math.max(1, end - 4);
                        }
                        const pageNum = start + i;
                        if (pageNum > booksData.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-num ${booksData.currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="page-nav next"
                      onClick={() => setPage(p => Math.min(booksData.totalPages, p + 1))}
                      disabled={booksData.currentPage === booksData.totalPages}
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </>
            ) : (
              <NotFound message="No Book Found" img="1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
