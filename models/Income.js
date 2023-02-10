const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoincremental = require("../utils/counter");

const incomeSchema = new Schema({
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
  from: {
    type: Number,
    required: true,
    default: 0,
  },
  to: {
    type: Number,
    required: true,
    default: 1,
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

incomeSchema.pre("validate", function (next) {
  if (this.isNew) {
    autoincremental(model, this, next);
  }
});

const model = mongoose.model("Income", incomeSchema);
module.exports = model;
