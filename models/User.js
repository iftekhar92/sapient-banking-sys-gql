const mongoose = require("mongoose");
const config = require('../config/constants')

const Schema = mongoose.Schema;
const autoincremental = require("../utils/counter");

const userSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    min: 1,
  },
  fullName: {
    type: String,
    required: true,
    min: 3,
    max: 150,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 150,
  },
  password: {
    type: String,
    required: false,
    min:6,
    max: 18,
  },
  phone: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["ADMIN", "CUSTOMER"],
    defaultValue: "CUSTOMER",
  },
  code: {
    type: String,
    max: 32,
    defaultValue: "",
  },
  forgotPasswordToken: {
    type: String,
    max: 32,
    defaultValue: "",
  },
  fkIncomeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  occupation: {
    type: String,
    max: 150,
    defaultValue: "",
  },
  address: {
    type: String,
    max: 200,
    defaultValue: "",
  },
  fkGovId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  govIdProof: {
    type: String,
    defaultValue: "",
  },
  profilePic: {
    type: String,
    defaultValue: "",
  },
  accountInfo: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      accountNumber: {
        type: String,
        max: config.account.accountNumberlength,
        defaultValue: "",
      },
      fkAccountTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      fkSavingsAccountId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      fkCardId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      cardNumber: {
        type: String,
        defaultValue: "",
      },
      cvvNumber: {
        type: String,
        defaultValue: "",
      },
      limitAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      availableAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      outstandingAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      startDate: {
        type: Date,
        default: Date.now(),
      },
      expiryDate: {
        type: Date,
        default: Date.now(),
      },
      status: {
        type: String,
        enum: ["APPROVED", "CANCELED", "REJECTED", "CONFIRMED"],
        defaultValue: "APPROVED",
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      updatedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  paymentHistory: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      txnId: {
        type: String,
        required: true,
        max: 10,
      },
      txnType: {
        type: String, // [Deposit, Withdrawal]
        required: true,
      },
      fkAccountTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      fkCardId: {
        type: mongoose.Schema.Types.ObjectId
      },
      fkSavingsAccountId: {
        type: mongoose.Schema.Types.ObjectId
      },
      amount: {
        type: Number,
        min: 1,
        required: true,
      },
      remark: {
        type: String,
        max: 20,
        defaultValue: "",
      },
      status: {
        type: String,
        enum: ["APPROVED", "CANCELED", "REJECTED", "CONFIRMED"],
        defaultValue: "APPROVED",
      },
      paymentAt: {
        type: Date,
        default: Date.now(),
      },
      paymentUpdatedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "DELETED"],
    defaultValue: "INACTIVE",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("validate", function (next) {
  if (this.isNew) {
    autoincremental(model, this, next);
  }
});

const model = mongoose.model("User", userSchema);
module.exports = model;
