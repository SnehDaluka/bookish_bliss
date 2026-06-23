import React from "react";
import imgsrc1 from "../images/not-found.svg";
import imgsrc2 from "../images/cart-empty.svg";

const NotFound = (props) => {
  return (
    <>
      <div className="not-found">
        <img src={props.img === "1" ? imgsrc1 : imgsrc2} alt="not-found" />
        <h2>{props.message}</h2>
      </div>
    </>
  );
};

export default NotFound;
