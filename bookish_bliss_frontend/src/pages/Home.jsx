import { NavLink } from "react-router-dom";
import imgsrc1 from "../images/home1.jpg";
import imgsrc4 from "../images/home2.jpg";
import { useSelector } from "react-redux";
import { useGetBooksQuery } from "../store/apiSlice";
import Card from "../components/Card";

const Home = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const { data: books, isLoading } = useGetBooksQuery();
  
  // Get 4 random books
  const featuredBooks = books && books.books ? [...books.books].sort(() => 0.5 - Math.random()).slice(0, 5) : [];

  return (
    <main className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container-fluid px-lg-5">
          <div className="row align-items-center">
            <div className="col-lg-5 hero-content order-2 order-lg-1 p-4 p-lg-0">
              <h1 className="hero-title fw-bold mb-4 text-primary" style={{ fontSize: "3.5rem" }}>Embrace the Magic of Reading.</h1>
              <p className="hero-subtitle text-muted fs-5 mb-5" style={{ lineHeight: "1.8" }}>
                A bookstore is a celebration of the written word and a haven
                for those who relish in its beauty. Discover your next adventure today.
              </p>
              <div className="hero-buttons d-flex gap-3">
                {isLoggedIn ? (
                  <NavLink className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-sm fw-bold" to="/books">
                    Explore Books <i className="fa-solid fa-arrow-right ms-2"></i>
                  </NavLink>
                ) : (
                  <NavLink className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-sm fw-bold" to="/login">
                    Join Bookish Bliss <i className="fa-solid fa-user-plus ms-2"></i>
                  </NavLink>
                )}
              </div>
            </div>
            <div className="col-lg-7 hero-image-container order-1 order-lg-2 text-center p-4 p-lg-5">
              <img className="img-fluid hero-img rounded-4 shadow-lg" src={imgsrc1} alt="Person reading" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="trust-bar bg-light py-5 border-top border-bottom">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="trust-item bg-white p-4 rounded-4 shadow-sm h-100 transition-hover">
                <div className="trust-icon text-primary mb-3"><i className="fa-solid fa-truck-fast fa-2x"></i></div>
                <h5 className="fw-bold mb-2 text-dark">Free Shipping</h5>
                <p className="text-muted small mb-0">On all orders over Rs 500</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="trust-item bg-white p-4 rounded-4 shadow-sm h-100 transition-hover">
                <div className="trust-icon text-primary mb-3"><i className="fa-solid fa-book-open fa-2x"></i></div>
                <h5 className="fw-bold mb-2 text-dark">Vast Collection</h5>
                <p className="text-muted small mb-0">Millions of titles available</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="trust-item bg-white p-4 rounded-4 shadow-sm h-100 transition-hover">
                <div className="trust-icon text-primary mb-3"><i className="fa-solid fa-shield-halved fa-2x"></i></div>
                <h5 className="fw-bold mb-2 text-dark">Secure Checkout</h5>
                <p className="text-muted small mb-0">100% safe & encrypted payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Books (Dynamic) */}
      <section className="featured-books py-5 mt-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 className="fw-bold mb-1 text-primary" style={{ fontSize: "2.5rem" }}>Trending Now</h2>
              <p className="text-muted fs-5 mb-0">Discover what everyone is reading</p>
            </div>
            <NavLink to="/books" className="btn btn-outline-primary rounded-pill px-4 fw-bold">View All <i className="fa-solid fa-arrow-right ms-2"></i></NavLink>
          </div>
          
          {isLoading ? (
            <div className="text-center my-5 py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
            </div>
          ) : (
            <div className="books-grid">
              {featuredBooks.map((book) => (
                <Card bookData={book} key={book._id} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Split Layout Story */}
      <section className="story-section bg-light py-5 mt-5">
        <div className="container px-lg-5 py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 order-2 order-lg-1">
              <img className="img-fluid rounded-4 shadow-lg w-100" src={imgsrc4} alt="Library" style={{ objectFit: "cover", maxHeight: "500px" }} />
            </div>
            <div className="col-lg-6 order-1 order-lg-2 px-lg-5">
              <h2 className="fw-bold mb-4 text-primary" style={{ fontSize: "2.5rem" }}>Welcome to Bookish Bliss</h2>
              <p className="fs-5 text-muted mb-4" style={{ lineHeight: "1.8" }}>
                Are you ready to embark on a journey through the magical realms
                of literature? Look no further, for Bookish Bliss is your
                ultimate destination for all things books.
              </p>
              <p className="text-muted mb-5" style={{ lineHeight: "1.8" }}>
                As avid readers and book enthusiasts ourselves, we have carefully curated a diverse
                and enchanting collection that caters to every reader's taste
                and preference. Whether you're hunting for a spine-tingling thriller or a heartwarming romance, we've got a shelf waiting for you.
              </p>
              <NavLink className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-sm" to="/books">
                Explore Catalog
              </NavLink>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;
