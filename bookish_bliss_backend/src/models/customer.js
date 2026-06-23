const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CustomerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 2,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    minlength: 2,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer_not_to_say"],
  },
  dob: {
    type: Date,

  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid email");
    },
  },
  phone: {
    type: String,
    validate(value) {
      if (value) {
        // Allows optional +, followed by 10-15 digits
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(value)) {
          throw new Error("Invalid phone number format");
        }
      }
    },
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: { type: Boolean, default: false }
    }
  ]
}, {
  timestamps: true
});

CustomerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

CustomerSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, { expiresIn: "30d" });
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const Customer = new mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
