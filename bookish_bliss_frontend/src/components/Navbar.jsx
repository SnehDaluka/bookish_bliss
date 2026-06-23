import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import imgsrc from "../images/bookish-bliss-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../store/slice";
import { useGetProfileQuery, useLogoutMutation, useGetCartItemsQuery, useGetWishlistQuery, useSearchBooksQuery } from "../store/apiSlice";

const Navbar = () => {
  const [data, setData] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedData, setDebouncedData] = useState("");
  const timeoutRef = React.useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state) => state.logging);
  const { data: profileData, isSuccess, isError } = useGetProfileQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  const { data: cartItems } = useGetCartItemsQuery(undefined, {
    skip: !state.isLoggedIn,
  });
  const { data: wishlistItems } = useGetWishlistQuery(undefined, {
    skip: !state.isLoggedIn,
  });
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const { data: searchResults, isFetching: isSearching } = useSearchBooksQuery(
    { name: debouncedData, page: 1 },
    { skip: debouncedData.trim().length < 2 }
  );

  const logOutUser = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    } catch (error) {
      console.error("Server Error");
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setData(value);
    setShowDropdown(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (data.trim()) {
      navigate(`/books/search?name=${encodeURIComponent(data)}`);
    } else {
      navigate(`/books`);
    }
  };

  useEffect(() => {
    if (isSuccess && profileData) {
      dispatch(login());
    } else if (isError) {
      dispatch(logout());
      localStorage.removeItem("isLoggedIn");
    }
  }, [isSuccess, isError, profileData, dispatch]);

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top custom-navbar flex-column">

        {/* Top Row: Logo, Desktop Search, Desktop Icons */}
        <div className="container-fluid top-row">
          <div className="d-flex align-items-center">
            <button
              className="navbar-toggler me-2 d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarTogglerDemo01"
              aria-controls="navbarTogglerDemo01"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars text-dark"></i>
            </button>
            <a className="navbar-brand m-0" href="/">
              <img src={imgsrc} alt="Bookish Bliss" className="img-fluid brand-logo" />
            </a>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="search-form d-none d-lg-flex position-relative"
            role="search"
          >
            <input
              type="search"
              placeholder="Search for books, authors, or genres..."
              aria-label="Search"
              name="name"
              value={data}
              onChange={handleChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <button type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            
            {showDropdown && debouncedData.trim().length >= 2 && (
              <div className="search-dropdown-menu shadow-sm">
                {isSearching ? (
                  <div className="p-3 text-center"><span className="spinner-border spinner-border-sm" style={{color: '#ff6200'}}></span></div>
                ) : searchResults?.books?.length > 0 ? (
                  <>
                    {searchResults.books.slice(0, 4).map(book => (
                      <div key={book._id} className="search-dropdown-item" onClick={() => navigate(`/book/${book._id}`)}>
                        <img src={book.imgsrc.startsWith('http') ? book.imgsrc : "/" + book.imgsrc} alt={book.name} />
                        <div className="item-details">
                          <h6 className="item-title">{book.name}</h6>
                          <span className="item-price">Rs {book.sprice}.00</span>
                        </div>
                      </div>
                    ))}
                    <div className="search-dropdown-footer text-center p-2 border-top" onClick={handleSearchSubmit} style={{cursor: 'pointer', color: '#ff6200', fontWeight: 'bold'}}>
                      View all results
                    </div>
                  </>
                ) : (
                  <div className="p-3 text-center text-muted">No books found</div>
                )}
              </div>
            )}
          </form>

          <div className="user-actions d-none d-lg-flex">
            {!state.isLoggedIn ? (
              <NavLink className="action-link" to="/login">
                <i className="fa-solid fa-right-to-bracket"></i> Login
              </NavLink>
            ) : (
              <>
                <NavLink className="action-link" to="/wishlist" title="Wishlist">
                  <i className="fa-solid fa-heart"></i>
                </NavLink>
                <NavLink className="action-link" to="/cart">
                  <i className="fa-solid fa-cart-shopping"></i> Cart
                  {cartItems && cartItems.length > 0 && (
                    <span className="cart-badge">{cartItems.length}</span>
                  )}
                </NavLink>

                <div className="dropdown">
                  <a
                    className="action-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa-solid fa-circle-user"></i> Account
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <NavLink className="dropdown-item" to="/profile">
                        <i className="fa-solid fa-id-card"></i> Profile
                      </NavLink>
                    </li>
                    <li>
                      <NavLink className="dropdown-item" to="/orders">
                        <i className="fa-solid fa-box-open"></i> My Orders
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logOutUser}>
                        <i className="fa-solid fa-right-from-bracket"></i> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Desktop Links & Mobile Collapse Menu */}
        <div className="container-fluid bottom-row">
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">

            {/* Mobile Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="search-form d-flex d-lg-none mt-3 position-relative"
              role="search"
            >
              <input
                type="search"
                placeholder="Search..."
                value={data}
                onChange={handleChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button type="submit">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              
              {showDropdown && debouncedData.trim().length >= 2 && (
                <div className="search-dropdown-menu shadow-sm" style={{top: '100%', left: 0, right: 0}}>
                  {isSearching ? (
                    <div className="p-3 text-center"><span className="spinner-border spinner-border-sm" style={{color: '#ff6200'}}></span></div>
                  ) : searchResults?.books?.length > 0 ? (
                    <>
                      {searchResults.books.slice(0, 4).map(book => (
                        <div key={book._id} className="search-dropdown-item" onClick={() => navigate(`/book/${book._id}`)}>
                          <img src={book.imgsrc.startsWith('http') ? book.imgsrc : "/" + book.imgsrc} alt={book.name} />
                          <div className="item-details">
                            <h6 className="item-title">{book.name}</h6>
                            <span className="item-price">Rs {book.sprice}.00</span>
                          </div>
                        </div>
                      ))}
                      <div className="search-dropdown-footer text-center p-2 border-top" onClick={handleSearchSubmit} style={{cursor: 'pointer', color: '#ff6200', fontWeight: 'bold'}}>
                        View all results
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center text-muted">No books found</div>
                  )}
                </div>
              )}
            </form>

            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/books">
                  Explore Books
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">
                  Contact Us
                </NavLink>
              </li>
            </ul>

            {/* Mobile User Actions */}
            <div className="mobile-user-actions d-lg-none">
              {!state.isLoggedIn ? (
                <NavLink className="action-link" to="/login">
                  <i className="fa-solid fa-right-to-bracket"></i> Login
                </NavLink>
              ) : (
                <>
                  <NavLink className="action-link" to="/profile">
                    <i className="fa-solid fa-id-card"></i> Profile
                  </NavLink>
                  <NavLink className="action-link" to="/orders">
                    <i className="fa-solid fa-box-open"></i> My Orders
                  </NavLink>
                  <NavLink className="action-link" to="/wishlist">
                    <i className="fa-solid fa-heart"></i> My Wishlist
                  </NavLink>
                  <NavLink className="action-link" to="/cart">
                    <i className="fa-solid fa-cart-shopping"></i> Shopping Cart
                    {cartItems && cartItems.length > 0 && (
                      <span className="cart-badge">{cartItems.length}</span>
                    )}
                  </NavLink>
                  <button className="action-link text-danger bg-transparent border-0 p-0 text-start" onClick={logOutUser}>
                    <i className="fa-solid fa-right-from-bracket"></i> Log Out
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
