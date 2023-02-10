const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const validate = require("./validate");

const createUpdateSchema = Joi.object({
  _id: Joi.string().allow("").optional().label("Resource ID"),
  name: Joi.string().max(150).required().trim().label("Name"),
  from: Joi.number().required().label("From"),
  to: Joi.number().required().label("To"),
  status: Joi.string().required().trim().label("Status"),
});

const createUpdate = (input) => validate(input, createUpdateSchema);

module.exports = { createUpdate };
