const mongoose = require("mongoose");
const validator = require("validator");

const messageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid email");
    },
  },
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ['Order Issue', 'General Inquiry', 'Feedback', 'Other'],
  },
  status: {
    type: String,
    default: 'unread',
    enum: ['unread', 'read', 'resolved'],
  }
}, {
  timestamps: true
});

const Messages = mongoose.model("Message", messageSchema);

module.exports = Messages;
