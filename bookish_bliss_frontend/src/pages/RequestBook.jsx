import React, { useState } from "react";
import { useRequestBookMutation } from "../store/apiSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const RequestBook = () => {
  const [data, setData] = useState({
    title: "",
    author: "",
    notes: "",
  });

  const [requestBookMutation, { isLoading }] = useRequestBookMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim() || !data.author.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Title and Author are required.',
        confirmButtonColor: '#ff6200'
      });
      return;
    }

    try {
      await requestBookMutation(data).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Request Submitted!',
        text: 'Book request submitted successfully!',
        confirmButtonColor: '#ff6200'
      }).then(() => {
        setData({ title: "", author: "", notes: "" });
        navigate("/");
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to submit request. Please try again.',
        confirmButtonColor: '#ff6200'
      });
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center mb-4" style={{ color: "#ff6200", fontFamily: "'Merienda', cursive" }}>
                Request a Book
              </h2>
              <p className="text-muted text-center mb-4">
                Can't find the book you are looking for? Let us know and we'll try to add it to our collection!
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label fw-bold">Book Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="author" className="form-label fw-bold">Author <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="author"
                    name="author"
                    value={data.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="form-label fw-bold">Additional Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={data.notes}
                    onChange={handleChange}
                    placeholder="Any specific edition, publication year, etc. (optional)"
                  ></textarea>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBook;
