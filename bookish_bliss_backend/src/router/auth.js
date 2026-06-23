const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
const mongoose = require("mongoose");

require("../db/conn");
const Books = require("../models/apiBooks");
const Customer = require("../models/customer");
const Messages = require("../models/message");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Wishlist = require("../models/wishlist");

router.get("/profile", authenticate, (req, res) => {
  res.status(200).json(req.rootUser);
});

router.patch("/profile", authenticate, async (req, res) => {
  try {
    const { firstname, lastname, phone, dob, gender, addresses } = req.body;
    const user = req.rootUser;
    
    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (addresses !== undefined) user.addresses = addresses;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/profile/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.rootUser;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save(); 

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      gender,
      dob,
      email,
      phone,
      password,
      cpassword,
    } = req.body;

    const userExist = await Customer.findOne({ email: email });
    if (userExist) {
      res.status(409).json({ status: 409, message: "User already exists" });
    } else if (password !== cpassword) {
      res.status(400).json({ status: 400, message: "Passwords do not match" });
    } else {
      const user = new Customer({
        firstname,
        lastname,
        gender,
        dob,
        email,
        phone,
        password,
      });
      // console.log(user);
      await user.save();
      res.status(201).json({
        status: 201,
        message: "User Registered Successfully!!!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: error.message || "Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await Customer.findOne({ email: email });
    if (!userData) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, userData.password);
    if (isMatch) {
      const token = await userData.generateAuthToken();
      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res.status(200).json({
        status: 200,
        email: email,
        message: "Logged In Successfully",
      });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.post("/addbook", authenticate, async (req, res) => {
  try {
    const {
      name,
      category,
      qty,
      author,
      publisher,
      pprice,
      sprice,
      authordetails,
      description,
      imgsrc,
    } = req.body;
    if (
      !name ||
      !category ||
      !qty ||
      !author ||
      !publisher ||
      !pprice ||
      !sprice ||
      !authordetails ||
      !description ||
      !imgsrc
    ) {
      return res.status(422).json({ error: "Please fill all the fields" });
    }
    const bookExist = await Books.findOne({ name: name });
    if (!bookExist) {
      const book = new Books({
        name,
        category,
        qty,
        author,
        publisher,
        pprice,
        sprice,
        authordetails,
        description,
        imgsrc,
      });
      const newBook = await book.save();
      res.status(201).send(newBook);
    } else {
      res.status(422).json({ error: "Book already exists" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;
    const messages = new Messages({
      email: email,
      name: name,
      message: message,
      subject: subject,
    });
    await messages.save();
    res.status(201).json({ message: "Message Saved" });
  } catch (error) {
    console.error("Messages POST Error:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Server Error",
    });
  }
});

router.get("/books", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const [books, totalCount] = await Promise.all([
      Books.find({}).limit(limit).skip(skip),
      Books.countDocuments({})
    ]);

    res.status(200).send({
      books,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalBooks: totalCount
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.get("/books/category/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit) || 25;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { category: { $regex: new RegExp(`^${name}$`, "i") } };

    const [books, totalCount] = await Promise.all([
      Books.find(query).limit(limit).skip(skip),
      Books.countDocuments(query)
    ]);

    res.status(200).send({
      books,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalBooks: totalCount
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.get("/books/search", async (req, res) => {
  try {
    const name = req.query.name;
    const limit = parseInt(req.query.limit) || 25;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedName, 'i');

    const [books, totalCount] = await Promise.all([
      Books.aggregate([
        { $match: { $or: [{ name: regex }, { author: regex }] } },
        {
          $addFields: {
            sortPriority: {
              $cond: {
                if: { $regexMatch: { input: "$name", regex: regex } },
                then: 1,
                else: 2
              }
            }
          }
        },
        { $sort: { sortPriority: 1, name: 1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      Books.countDocuments({ $or: [{ name: regex }, { author: regex }] })
    ]);

    res.status(200).send({
      books,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalBooks: totalCount
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.get("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const book = await Books.find({ _id: id });
    // console.log(book);
    res.status(200).send(book);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.get("/bookname", async (req, res) => {
  try {
    const name = req.query.name;
    const book = await Books.find({ name: name });
    res.status(200).send(book);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
});

router.get("/cart", authenticate, async (req, res) => {
  try {
    const name = req.query.name;
    const userId = req.rootUser._id;
    const bookObj = await Books.findOne({ name: name });
    if (!bookObj) return res.status(200).send({ found: false });

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      const itemExists = cart.items.find(item => item.book.toString() === bookObj._id.toString());
      if (itemExists) return res.status(200).send({ found: true });
    }
    res.status(200).send({ found: false });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/addtocart", authenticate, async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.rootUser._id;
    const book = await Books.findById(_id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.book.toString() === _id.toString());
    const newQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity + 1 : 1;

    if (newQuantity > book.qty) {
      return res.status(400).json({ message: `Cannot buy more than ${book.qty} books` });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ book: _id, quantity: 1, priceAtAdd: book.sprice });
    }
    
    await cart.save();

    // Remove from wishlist if exists
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(item => item.book.toString() !== _id.toString());
      await wishlist.save();
    }

    res.status(201).json({ message: "item added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/cartitems", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.book');
    if (!cart || !cart.items) return res.status(200).send([]);

    const formattedBooks = cart.items.map(item => ({
      _id: item.book._id,
      bookname: item.book.name,
      quantity: item.quantity,
      price: item.book.sprice,
      originalPrice: item.book.pprice,
    }));
    res.status(200).send(formattedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/cart", authenticate, async (req, res) => {
  try {
    const name = req.query.name;
    const userId = req.rootUser._id;
    
    const bookObj = await Books.findOne({ name: name });
    if (!bookObj) return res.status(404).json({ message: "Book not found" });

    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { book: bookObj._id } } }
    );
    res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/cart", authenticate, async (req, res) => {
  try {
    const name = req.query.name;
    const { quantity } = req.body;
    const userId = req.rootUser._id;

    const bookObj = await Books.findOne({ name: name });
    if (!bookObj) return res.status(404).json({ message: "Book not found" });

    if (quantity > bookObj.qty) {
      return res.status(400).json({ message: `Cannot buy more than ${bookObj.qty} books` });
    }

    await Cart.updateOne(
      { user: userId, "items.book": bookObj._id },
      { $set: { "items.$.quantity": quantity } }
    );
    res.status(200).json({ message: "Quantity updated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/cart/all", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });
    res.status(200).json({ message: "Books deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { email, token } = req.body;
    await Customer.findOneAndUpdate(
      { email, email },
      { $pull: { tokens: { token: token } } },
      { safe: true, multi: false }
    );
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Orders Route
router.post("/orders", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    
    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.book');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Format items and calculate totals
    let totalAmount = 0;
    let totalOriginalAmount = 0;
    const orderItems = cart.items.map(item => {
      const price = item.book.sprice || 0;
      const originalPrice = item.book.pprice || price;
      
      totalAmount += price * item.quantity;
      totalOriginalAmount += originalPrice * item.quantity;

      return {
        bookId: item.book._id,
        bookname: item.book.name,
        price: price,
        quantity: item.quantity,
        imgsrc: item.book.imgsrc
      };
    });

    const totalDiscount = totalOriginalAmount - totalAmount;

    // Create Order
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      totalDiscount: totalDiscount,
      status: 'Processing'
    });

    await newOrder.save();

    // Update Book Stock
    for (const item of orderItems) {
      if (item.bookId) {
        await Books.findByIdAndUpdate(item.bookId, {
          $inc: { qty: -item.quantity }
        });
      }
    }

    // Clear the cart after successful order placement
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });

    res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

router.get("/orders", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    // Fetch orders, sort by newest first
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    const orderId = req.params.id;
    
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Get Single Order Error:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

// Get User Ratings
router.get("/user/ratings", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    // Find all books that have a review by this user
    const booksWithReviews = await Books.find({ "reviews.user": userId });
    
    // Create a map of bookId -> rating AND bookname -> rating
    const ratingsMap = {};
    booksWithReviews.forEach(book => {
      const review = book.reviews.find(r => r.user.toString() === userId.toString());
      if (review) {
        ratingsMap[book._id.toString()] = review.rating;
        ratingsMap[book.name] = review.rating;
      }
    });

    res.status(200).json(ratingsMap);
  } catch (error) {
    console.error("Get User Ratings Error:", error);
    res.status(500).json({ message: "Failed to fetch user ratings" });
  }
});

// Rate Book Route
router.post("/books/:id/rate", authenticate, async (req, res) => {
  try {
    let bookId = req.params.id;
    const userId = req.rootUser._id;
    const { rating, bookName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    let book;
    if (bookId !== "undefined" && mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Books.findById(bookId);
    }

    // Fallback if bookId is missing, or if it's an old order ID from before a database reset
    if (!book && bookName) {
      book = await Books.findOne({ name: bookName.toLowerCase() });
    }

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user already reviewed
    const existingReviewIndex = book.reviews.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReviewIndex !== -1) {
      // Update existing rating
      book.reviews[existingReviewIndex].rating = rating;
    } else {
      // Add new rating
      book.reviews.push({ user: userId, rating });
    }

    // Recalculate average rating
    const sum = book.reviews.reduce((acc, item) => acc + item.rating, 0);
    book.rating = (sum / book.reviews.length).toFixed(1);

    await book.save();

    res.status(200).json({ message: "Book rated successfully", rating: book.rating });
  } catch (error) {
    console.error("Rate Book Error:", error);
    res.status(500).json({ message: "Failed to rate book" });
  }
});

// ================= WISHLIST ROUTES =================

// Get User Wishlist
router.get("/wishlist", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    let wishlist = await Wishlist.findOne({ user: userId }).populate("items.book");
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
      await wishlist.save();
    }
    
    res.status(200).json(wishlist.items);
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

// Add to Wishlist
router.post("/wishlist/add", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    const { _id } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const itemExists = wishlist.items.find(item => item.book.toString() === _id);
    if (!itemExists) {
      wishlist.items.push({ book: _id });
      await wishlist.save();
    }

    // Return populated wishlist
    wishlist = await Wishlist.findOne({ user: userId }).populate("items.book");
    res.status(200).json(wishlist.items);
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// Remove from Wishlist
router.delete("/wishlist/remove/:id", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    const bookIdToRemove = req.params.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(item => item.book.toString() !== bookIdToRemove);
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findOne({ user: userId }).populate("items.book");
    res.status(200).json(updatedWishlist ? updatedWishlist.items : []);
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

module.exports = router;
