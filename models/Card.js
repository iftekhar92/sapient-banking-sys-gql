const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoincremental = require("../utils/counter");

const cardsSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    min: 1,
  },
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    min: 3,
    max: 150,
  },
  fkIncomeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fkAccountTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fkCardTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  validityNoOfYear: {
    type: Number,
    min: 1,
    default: 1,
  },
  limitAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  annualCharge: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    defaultValue: "ACTIVE",
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

cardsSchema.pre("validate", function (next) {
  if (this.isNew) {
    autoincremental(model, this, next);
  }
});

const model = mongoose.model("Card", cardsSchema);
module.exports = model;
