import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import imgsrc from "../images/login.svg";
import imgsrc2 from "../images/bookish-bliss-logo.png";
import { useDispatch } from "react-redux";
import { login } from "../store/slice";
import { useLoginMutation } from "../store/apiSlice";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [valid, setValid] = useState(true);
  const [loginMutation, { isLoading: load }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValid(true);
    setData((oldData) => {
      return { ...oldData, [name]: value };
    });
  };

  const handlesubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await loginMutation({ ...data }).unwrap();
      
      setData({
        email: "",
        password: "",
      });
      localStorage.setItem("isLoggedIn", "true");
      dispatch(login());
      setValid(true);
      navigate("/");
    } catch (err) {
      if (err.status === 500 || err.status === 400) {
        setValid(false);
      } else {
        console.error("Server Error");
      }
    }
  };
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) navigate("/");
  }, [navigate]);
  return (
    <div className="login-split-container">
      <div className="image-section">
        <div className="overlay-text">
          <h2>Welcome Back</h2>
          <p>Resume your literary journey with Bookish Bliss.</p>
        </div>
      </div>
      
      <div className="form-section">
        <div className="auth-card">
          <div className="login-logo">
            <img src={imgsrc2} alt="Bookish Bliss" />
          </div>

          <form method="post" onSubmit={handlesubmit}>
            {!valid && (
              <div className="alert alert-danger p-2 mb-4" role="alert">
                Invalid Credentials
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="username"
                value={data.email}
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                minLength="6"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-submit" disabled={load}>
              {load ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
            
            <div className="auth-link">
              <a href="/register">Create An Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
