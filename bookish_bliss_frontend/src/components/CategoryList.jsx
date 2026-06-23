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
    <>
      <div className="list-group category-list">
        <NavLink
          to="/books"
          end
          className="list-group-item list-group-item-action"
        >
          All
        </NavLink>
        {categories.map((category) => (
          <NavLink
            key={category}
            to={`/books/${category}`}
            className="list-group-item list-group-item-action"
          >
            {category}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default CategoryList;
