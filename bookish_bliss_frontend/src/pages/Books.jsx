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

  // Reset page to 1 when category or search changes
  useEffect(() => {
    setPage(1);
  }, [category, searchParams.get("name")]);

  const { data: allBooks, isLoading: loadingAll } = useGetBooksQuery(page, {
    skip: props.pathName !== "home",
  });

  const { data: categoryBooks, isLoading: loadingCategory } = useGetBooksByCategoryQuery({ category, page }, {
    skip: props.pathName !== "category",
  });

  const { data: searchBooks, isLoading: loadingSearch } = useSearchBooksQuery({ name: searchParams.get("name"), page }, {
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
    <>
      <div className="container-fluid mb-2">
        <div className="row books-heading">
          <div className="col-12">
            <img src={imgsrc} alt="logo" />
            <h1>Books</h1>
          </div>
        </div>
        <div className="row books-heading2">
          <div className="col-12 main_heading p-2">
            <button
              className="btn btn-primary d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasResponsive"
              aria-controls="offcanvasResponsive"
              style={{ background: "transparent", borderColor: "black" }}
            >
              <i className="fa-solid fa-bars" style={{ color: "black" }}></i>
            </button>

            <h2>Category - {category || "All"}</h2>
          </div>
        </div>
        <div className="row books-category">
          <div className="col-2 p-0 booklist">
            <CategoryOptions />
          </div>
          <div className="col-lg-10 col-12 p-0 books-list">
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
                  <div className="d-flex justify-content-center align-items-center mt-5 mb-5 pb-4 gap-4">
                    <button 
                      className="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={booksData.currentPage === 1}
                    >
                      <i className="fa-solid fa-chevron-left me-2"></i> Previous
                    </button>
                    <span className="fw-bold fs-5 text-muted px-3 py-2 bg-light rounded-pill shadow-sm border">
                      Page {booksData.currentPage} of {booksData.totalPages}
                    </span>
                    <button 
                      className="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold" 
                      onClick={() => setPage(p => Math.min(booksData.totalPages, p + 1))}
                      disabled={booksData.currentPage === booksData.totalPages}
                    >
                      Next <i className="fa-solid fa-chevron-right ms-2"></i>
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
    </>
  );
};

export default Books;
