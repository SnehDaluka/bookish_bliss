import React from "react";
import { Link } from "react-router-dom";
import imgsrc from "../images/bookish-bliss-logo2.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer">
      <div className="container-fluid px-lg-5">
        <div className="row pt-5 pb-4 gy-4 gx-lg-5 footer-top">
          {/* About Section */}
          <div className="col-12 col-lg-4 footer-brand-col">
            <img src={imgsrc} alt="Bookish Bliss Logo" className="footer-logo mb-3" />
            <p className="text-muted pe-lg-4" style={{ lineHeight: "1.8" }}>
              At Bookish Bliss, we celebrate the art of reading. Our cozy
              reading corners invite you to lose yourself in the pages of a
              beloved classic or to explore the latest bestseller. Escape the
              hustle and bustle of the outside world as you indulge in the
              comfort of our warm ambiance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-title fw-bold mb-4">Quick Links</h4>
            <ul className="footer-links list-unstyled">
              <li className="mb-2"><Link to="/profile">My Account</Link></li>
              <li className="mb-2"><Link to="/books">Books</Link></li>
              <li className="mb-2"><Link to="/cart">Cart</Link></li>
              <li className="mb-2"><Link to="/wishlist">Wishlist</Link></li>
              <li className="mb-2"><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-title fw-bold mb-4">Support</h4>
            <ul className="footer-links list-unstyled">
              <li className="mb-2"><Link to="/support">Tech Support</Link></li>
              <li className="mb-2"><Link to="/docs">Documentation</Link></li>
              <li className="mb-2"><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Social & Payments */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mb-5">
              <h4 className="footer-title fw-bold mb-4">Follow Us</h4>
              <div className="social-icons d-flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook fa-lg"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram fa-lg"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="fa-brands fa-twitter fa-lg"></i></a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube fa-lg"></i></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin fa-lg"></i></a>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="footer-title fw-bold mb-4">Payment Methods</h4>
              <div className="payment-icons d-flex align-items-center gap-3 pt-2">
                <i className="fa-brands fa-cc-visa fa-2xl"></i>
                <i className="fa-brands fa-cc-mastercard fa-2xl"></i>
                <i className="fa-brands fa-google-pay fa-2xl"></i>
                <i className="fa-brands fa-cc-paypal fa-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom border-top border-secondary py-4">
        <div className="container-fluid px-lg-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0 copyright-text text-muted">
                &copy; {currentYear} <span className="text-primary fw-bold">Bookish Bliss</span> By Sneh Daluka. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-legal-links d-flex justify-content-center justify-content-md-end gap-3">
                <Link to="/privacy-policy" className="text-muted text-decoration-none hover-orange">Privacy Policy</Link>
                <span className="text-muted opacity-50">|</span>
                <Link to="/terms" className="text-muted text-decoration-none hover-orange">Terms & Conditions</Link>
                <span className="text-muted opacity-50">|</span>
                <Link to="/cookies" className="text-muted text-decoration-none hover-orange">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
