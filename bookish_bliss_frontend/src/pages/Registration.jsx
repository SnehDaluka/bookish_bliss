import React, { useEffect, useState } from "react";
import imgsrc from "../images/bookish-bliss-logo.png";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../store/apiSlice";
import Swal from "sweetalert2";
import "../scss/_registration.scss";
import CustomDatePicker from "../components/CustomDatePicker";

const Registration = () => {
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
  });
  const [valid, setValid] = useState(true);
  const [registerMutation, { isLoading: load }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValid(true);
    setData((oldData) => {
      return { ...oldData, [name]: value };
    });
  };

  const handleGenderSelect = (val) => {
    setValid(true);
    setData((oldData) => ({ ...oldData, gender: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.cpassword) {
      setValid(false);
    } else {
      try {
        const response = await registerMutation({ ...data }).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.message,
          confirmButtonColor: '#ff6200'
        });
        setData({
          firstname: "",
          lastname: "",
          gender: "",
          dob: "",
          email: "",
          phone: "",
          password: "",
          cpassword: "",
        });
        navigate("/login");
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err.data?.message || "Server Error",
          confirmButtonColor: '#ff6200'
        });
        navigate("/register");
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="registration-split-container">
      <div className="image-section">
        <div className="overlay-text">
          <h2>Join Bookish Bliss</h2>
          <p>Discover your next great adventure.</p>
        </div>
      </div>
      <div className="form-section">
        <div className="auth-card">
          <form
          onSubmit={handleSubmit}
          method="POST"
          className="row g-3 needs-validation"
        >
          <div className="col-12 register-logo">
            <img src={imgsrc} className="img-fluid" alt="logo" />
          </div>

          {!valid && (
            <div className="col-12">
              <div className="alert alert-danger p-2" role="alert">
                Password does not match
              </div>
            </div>
          )}

          <div className="col-md-6">
            <label htmlFor="validationCustom01" className="form-label">
              First name
            </label>
            <input
              type="text"
              className="form-control"
              id="validationCustom01"
              name="firstname"
              value={data.firstname}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="col-md-6">
            <label htmlFor="validationCustom02" className="form-label">
              Last name
            </label>
            <input
              type="text"
              className="form-control"
              id="validationCustom02"
              name="lastname"
              onChange={handleChange}
              value={data.lastname}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="validationCustomEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="validationCustomEmail"
              name="email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="validationCustomPhone" className="form-label">
              Phone <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="validationCustomPhone"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              placeholder="e.g. +1234567890 (No spaces)"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Gender <span className="optional">(Optional)</span>
            </label>
            <div className="dropdown w-100">
              <button
                className="btn form-control dropdown-toggle text-start d-flex justify-content-between align-items-center"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ backgroundColor: "#fcfcfc", border: "2px solid #ecf0f1", height: "100%" }}
              >
                {data.gender 
                  ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1).replace(/_/g, " ") 
                  : "Select..."}
              </button>
              <ul className="dropdown-menu w-100 border-0 custom-dropdown-menu">
                <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("male")}>Male</button></li>
                <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("female")}>Female</button></li>
                <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("other")}>Other</button></li>
                <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("prefer_not_to_say")}>Prefer not to say</button></li>
              </ul>
            </div>
          </div>

          <div className="col-md-4">
            <label htmlFor="validationCustomDOB" className="form-label">
              Date of Birth <span className="optional">(Optional)</span>
            </label>
            <CustomDatePicker 
              selectedDate={data.dob ? new Date(data.dob) : null} 
              onChange={(date) => { 
                const formattedDate = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : ""; 
                setData(prev => ({ ...prev, dob: formattedDate })); 
                setValid(true); 
              }} 
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="validationCustom03" className="form-label">
              Password
            </label>
            <input
              type="password"
              minLength="6"
              className="form-control"
              id="validationCustom03"
              name="password"
              value={data.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="col-md-6">
            <label htmlFor="validationCustom04" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              minLength="6"
              className="form-control"
              id="validationCustom04"
              name="cpassword"
              value={data.cpassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn-register"
              disabled={load}
            >
              {load ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Registration;
