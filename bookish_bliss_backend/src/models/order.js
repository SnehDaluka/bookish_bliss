const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiBook' },
      bookname: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      imgsrc: { type: String }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  }
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
