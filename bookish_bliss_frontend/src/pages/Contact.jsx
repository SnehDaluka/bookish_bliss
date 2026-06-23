import React, { useEffect, useState } from "react";
// import { login } from "../store/slice";
import { useSelector } from "react-redux";
import { useGetProfileQuery, useSendMessageMutation } from "../store/apiSlice";
import Swal from "sweetalert2";

const Contact = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "General Inquiry"
  });
  const state = useSelector((state) => state.logging);
  
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !localStorage.getItem("token") || !state.isLoggedIn,
  });
  const [sendMessageMutation, { isLoading: load }] = useSendMessageMutation();

  useEffect(() => {
    if (profileData && state.isLoggedIn) {
      setData((oldData) => ({
        ...oldData,
        name: profileData.firstname + " " + profileData.lastname,
        email: profileData.email,
        message: "",
      }));
    }
  }, [profileData, state.isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((oldData) => {
      return { ...oldData, [name]: value };
    });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...data,
        subject: data.subject || "General Inquiry"
      };
      await sendMessageMutation(payload).unwrap();
      setData({
        ...data,
        message: "",
        subject: payload.subject
      });
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'We will get back to you shortly.',
        confirmButtonColor: '#ff6200'
      });
    } catch (err) {
      console.error("Contact form error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.data?.message || "Server Error",
        confirmButtonColor: '#ff6200'
      });
    }
  };



  return (
    <div className="contact-container d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="contact-card">
          {/* Left Form Section */}
          <div className="contact-form-section">
            <h1>Get in Touch</h1>
            <form onSubmit={handlesubmit} method="POST">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={data.name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="name">Name</label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Your Email"
                      value={data.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
              </div>

              <div className="form-floating mb-3">
                <select 
                  className="form-select" 
                  id="subject" 
                  name="subject"
                  value={data.subject}
                  onChange={handleChange}
                >
                  <option value="Order Issue">Order Issue</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
                <label htmlFor="subject">Subject</label>
              </div>

              <div className="form-floating mb-1">
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  style={{ height: '150px' }}
                  maxLength="500"
                  value={data.message}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="message">Message</label>
              </div>
              <div className={`char-counter ${data.message.length > 450 ? 'near-limit' : ''}`}>
                {data.message.length}/500
              </div>

              <button type="submit" className="btn btn-submit" disabled={load}>
                {load ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span className="px-2" role="status">Sending...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Right Info Section */}
          <div className="contact-info-section">
            <div>
              <h3>Visit Us</h3>
              <p>INDIA</p>
              <div className="contact-info-header">
                <h2>Let's Talk!</h2>
                <p>We'd love to hear from you. Reach out to us using the details below.</p>
              </div>

              <h3>Contact Details</h3>
              <p className="mb-1">📞 (+91) 7544972548</p>
              <p>✉️ snehdaluka@gmail.com</p>
            </div>

            <div className="social-icons">
              <h3>Follow Us</h3>
              <div className="icon-wrapper">
                <a href="#"><i className="fa-brands fa-facebook"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
