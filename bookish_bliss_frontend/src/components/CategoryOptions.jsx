import React from "react";
import CategoryList from "./CategoryList";

const CategoryOptions = () => {
  return (
    <div
      className="offcanvas-lg offcanvas-start bg-white"
      tabIndex="-1"
      id="offcanvasResponsive"
      aria-labelledby="offcanvasResponsiveLabel"
    >
      <div className="offcanvas-header d-lg-none">
        <h5 className="offcanvas-title fw-bold" id="offcanvasResponsiveLabel">
          Filter by Category
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          data-bs-target="#offcanvasResponsive"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="category-sidebar w-100">
          <div className="sidebar-title d-none d-lg-flex">
            <i className="fa-solid fa-list-ul text-primary"></i> Categories
          </div>
          <CategoryList />
        </div>
      </div>
    </div>
  );
};

export default CategoryOptions;
