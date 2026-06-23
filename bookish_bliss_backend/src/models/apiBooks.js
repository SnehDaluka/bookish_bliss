const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    apiId: {
      type: String,
      unique: true,
      sparse: true, // Allows nulls/undefined for books not from API
    },
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: [String],
      required: true,
      index: true,
    },
    qty: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    publisher: {
      type: String,
      required: true,
      trim: true,
    },
    pprice: {
      type: Number,
      required: true,
      min: [0, "Purchase price cannot be negative"],
    },
    sprice: {
      type: Number,
      required: true,
      min: [0, "Selling price cannot be negative"],
    },
    authordetails: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imgsrc: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    pageCount: {
      type: Number,
      min: [1, "Page count must be greater than 0"],
    },
    publicationDate: {
      type: String,
      trim: true,
    },
    isbn10: {
      type: String,
      trim: true,
    },
    isbn13: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot be above 5"],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index(
  { name: "text", author: "text", category: "text" },
  { name: "books_text_index", language_override: "text_language" }
);
const ApiBooks = new mongoose.model("ApiBook", ItemSchema);

module.exports = ApiBooks;
