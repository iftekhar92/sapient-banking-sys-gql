const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoincremental = require("../utils/counter");

const accountTypeSchema = new Schema({
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

accountTypeSchema.pre("validate", function (next) {
  if (this.isNew) {
    autoincremental(model, this, next);
  }
});

const model = mongoose.model("AccountType", accountTypeSchema);
module.exports = model;
