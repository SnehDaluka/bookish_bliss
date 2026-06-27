import React from "react";
import { NavLink } from "react-router-dom";

const CategoryList = () => {
  const categories = [
    "Fiction",
    "Romance",
    "Thriller",
    "Programming",
    "Business",
    "History",
    "Science",
    "Biography",
    "Fantasy",
    "Mystery",
    "Philosophy",
    "Art",
    "Music",
    "Cooking"
  ];

  return (
    <div className="category-list">
      <NavLink
        to="/books"
        end
        className={({ isActive }) => isActive ? "active" : ""}
      >
        <span>All Categories</span>
        <i className="fa-solid fa-chevron-right small opacity-50"></i>
      </NavLink>
      {categories.map((category) => (
        <NavLink
          key={category}
          to={`/books/${category}`}
          className={({ isActive }) => isActive ? "active" : ""}
        >
          <span>{category}</span>
          <i className="fa-solid fa-chevron-right small opacity-50"></i>
        </NavLink>
      ))}
    </div>
  );
};

export default CategoryList;
