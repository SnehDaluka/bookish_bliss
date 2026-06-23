import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Header = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default Header;
