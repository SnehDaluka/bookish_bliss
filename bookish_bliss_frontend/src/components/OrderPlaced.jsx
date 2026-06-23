import React, { useEffect } from "react";
import imgsrc from "../images/order-placed.svg";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const OrderPlaced = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("email")) navigate("/");
  });
  return (
    <>
      <div className="order-placed">
        <img src={imgsrc} alt="order-placed" />
        <h2>You have placed the order successfully.</h2>
        <button className="btn btn-dark" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    </>
  );
};

export default OrderPlaced;
