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
const RequestedBook = require("../models/requestedBook");

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

const getSortObject = (sortQuery) => {
  switch (sortQuery) {
    case 'price_asc': return { sprice: 1, _id: 1 };
    case 'price_desc': return { sprice: -1, _id: 1 };
    case 'rating_desc': return { rating: -1, _id: 1 };
    case 'name_asc': return { name: 1, _id: 1 };
    case 'recommended':
    default: return { _id: -1 }; 
  }
};

router.get("/books", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 18;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(req.query.sort);

    const [books, totalCount] = await Promise.all([
      Books.find({}).sort(sortObj).limit(limit).skip(skip),
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
    const limit = parseInt(req.query.limit) || 18;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(req.query.sort);

    const query = { category: { $regex: new RegExp(`^${name}$`, "i") } };

    const [books, totalCount] = await Promise.all([
      Books.find(query).sort(sortObj).limit(limit).skip(skip),
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
    const limit = parseInt(req.query.limit) || 18;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(req.query.sort);

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
        { $sort: { sortPriority: 1, ...sortObj } },
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

router.post("/books/request", authenticate, async (req, res) => {
  try {
    const { title, author, notes } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ message: "Title and Author are required." });
    }

    const requestedBook = new RequestedBook({
      title,
      author,
      notes,
      user: req.userID, // set by the authenticate middleware
    });

    await requestedBook.save();
    res.status(201).json({ message: "Book request submitted successfully", requestedBook });
  } catch (error) {
    console.error("Error submitting requested book:", error);
    res.status(500).json({ message: "Server Error" });
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

router.post("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    
    res.clearCookie("token", { path: "/" });
    await req.rootUser.save();
    
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

// Get Personalized Recommendations (Advanced Collaborative Filtering)
router.get("/books/recommendations", authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id;
    const userIdStr = userId.toString();

    // --- STEP 1: GATHER IMPLICIT FEEDBACK ---
    // Fetch user interactions: Orders (Weight 3), Cart (Weight 2), Wishlist (Weight 1)
    const [userOrders, userCart, userWishlist] = await Promise.all([
      Order.find({ user: userId }).select('items.bookId').lean(),
      Cart.findOne({ user: userId }).select('items.book').lean(),
      Wishlist.findOne({ user: userId }).select('items.book').lean()
    ]);

    const currentUserInteractions = {}; // { bookIdStr: weight }
    const interactedBookIdsSet = new Set();

    if (userWishlist && userWishlist.items) {
      userWishlist.items.forEach(item => {
        if (item.book) {
          currentUserInteractions[item.book.toString()] = 1;
          interactedBookIdsSet.add(item.book.toString());
        }
      });
    }

    if (userCart && userCart.items) {
      userCart.items.forEach(item => {
        if (item.book) {
          currentUserInteractions[item.book.toString()] = 2; // Overrides wishlist
          interactedBookIdsSet.add(item.book.toString());
        }
      });
    }

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.bookId) {
          currentUserInteractions[item.bookId.toString()] = 3; // Highest weight
          interactedBookIdsSet.add(item.bookId.toString());
        }
      });
    });

    const interactedBookIdsArr = Array.from(interactedBookIdsSet);
    let recommendedBookIds = [];

    // --- STEP 2: COLLABORATIVE FILTERING (JACCARD SIMILARITY) ---
    if (interactedBookIdsArr.length > 0) {
      // Find ALL other users who have interacted with ANY of these books
      const [otherOrders, otherCarts, otherWishlists] = await Promise.all([
        Order.find({ user: { $ne: userId }, "items.bookId": { $in: interactedBookIdsArr } }).select('user items.bookId').lean(),
        Cart.find({ user: { $ne: userId }, "items.book": { $in: interactedBookIdsArr } }).select('user items.book').lean(),
        Wishlist.find({ user: { $ne: userId }, "items.book": { $in: interactedBookIdsArr } }).select('user items.book').lean()
      ]);

      // Build interaction profiles for other users
      const otherUsersProfiles = {}; // { otherUserIdStr: { bookIdStr: weight } }

      const addOtherInteraction = (otherUserId, bookId, weight) => {
        if (!otherUserId || !bookId) return;
        const uid = otherUserId.toString();
        const bid = bookId.toString();
        if (!otherUsersProfiles[uid]) otherUsersProfiles[uid] = {};
        // Keep highest weight
        if (!otherUsersProfiles[uid][bid] || otherUsersProfiles[uid][bid] < weight) {
          otherUsersProfiles[uid][bid] = weight;
        }
      };

      otherWishlists.forEach(w => w.items.forEach(i => addOtherInteraction(w.user, i.book, 1)));
      otherCarts.forEach(c => c.items.forEach(i => addOtherInteraction(c.user, i.book, 2)));
      otherOrders.forEach(o => o.items.forEach(i => addOtherInteraction(o.user, i.bookId, 3)));

      // Calculate Jaccard Similarity and Score Candidates
      const candidateBooks = {}; // { bookIdStr: totalScore }

      for (const [otherUserIdStr, otherProfile] of Object.entries(otherUsersProfiles)) {
        const otherBookIds = Object.keys(otherProfile);
        
        // Jaccard Calculation
        let intersection = 0;
        otherBookIds.forEach(bid => {
          if (interactedBookIdsSet.has(bid)) intersection++;
        });

        const union = new Set([...interactedBookIdsArr, ...otherBookIds]).size;
        const similarityScore = intersection / union;

        // If similar, add their other books to candidates
        if (similarityScore > 0) {
          otherBookIds.forEach(bid => {
            if (!interactedBookIdsSet.has(bid)) {
              // Score = Similarity * Weight of interaction
              const score = similarityScore * otherProfile[bid];
              candidateBooks[bid] = (candidateBooks[bid] || 0) + score;
            }
          });
        }
      }

      // Sort candidates by score
      recommendedBookIds = Object.keys(candidateBooks)
        .sort((a, b) => candidateBooks[b] - candidateBooks[a])
        .slice(0, 10);
    }

    let recommendations = [];

    // Fetch actual book documents for the ML recommendations
    if (recommendedBookIds.length > 0) {
      recommendations = await Books.find({ _id: { $in: recommendedBookIds } });
    }

    // --- STEP 3: CATEGORY-AWARE FALLBACK ---
    if (recommendations.length < 10) {
      const remainingCount = 10 - recommendations.length;
      let fallbackBooks = [];
      const excludeIds = [...interactedBookIdsArr, ...recommendedBookIds];

      if (interactedBookIdsArr.length > 0) {
        // Find user's favorite categories
        const interactedBooks = await Books.find({ _id: { $in: interactedBookIdsArr } }).select('category').lean();
        const categoryFreq = {};
        interactedBooks.forEach(b => {
          if (b.category) {
            b.category.forEach(c => {
              categoryFreq[c] = (categoryFreq[c] || 0) + 1;
            });
          }
        });

        const topCategories = Object.keys(categoryFreq).sort((a, b) => categoryFreq[b] - categoryFreq[a]).slice(0, 2);

        if (topCategories.length > 0) {
          fallbackBooks = await Books.find({ 
            category: { $in: topCategories },
            _id: { $nin: excludeIds }
          })
          .sort({ rating: -1 })
          .limit(remainingCount);
        }
      }

      // If STILL less than 10 (e.g. brand new user or no category matches), use generic trending fallback
      if (fallbackBooks.length < remainingCount) {
        const stillRemaining = remainingCount - fallbackBooks.length;
        const fallbackIds = fallbackBooks.map(b => b._id.toString());
        const totalExcludeIds = [...excludeIds, ...fallbackIds];

        const genericFallback = await Books.find({ _id: { $nin: totalExcludeIds } })
          .sort({ rating: -1, sprice: 1 }) 
          .limit(stillRemaining);
        
        fallbackBooks = [...fallbackBooks, ...genericFallback];
      }

      recommendations = [...recommendations, ...fallbackBooks];
    }

    res.status(200).json(recommendations);

  } catch (error) {
    console.error("Advanced Recommendations Error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

module.exports = router;
