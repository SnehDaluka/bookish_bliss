import React, { useEffect } from "react";
import Cart from "./Cart";
import { useNavigate } from "react-router-dom";
import { useGetCartItemsQuery } from "../store/apiSlice";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { data = [], isSuccess } = useGetCartItemsQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });

  useEffect(() => {
    if (
      !localStorage.getItem("token") ||
      document.referrer.endsWith("orderdetails")
    ) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuccess && data.length === 0) {
      navigate("/");
    }
  }, [isSuccess, data, navigate]);
  return (
    <>
      <Cart pageName="order-details" />
    </>
  );
};

export default OrderDetails;
