const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const validate = require("./validate");

const createUpdateSchema = Joi.object({
  _id: Joi.string().allow("").optional().label("Resource ID"),
  fkIncomeId: Joi.string().required().trim().label("Annual Income"),
  fkAccountTypeId: Joi.string().required().trim().label("Account Type"),
  name: Joi.string().max(150).required().trim().label("Name"),
  fkCardTypeId: Joi.string().required().trim().label("Card Type"),
  validityNoOfYear: Joi.number().required().label("Validity Number of Year"),
  limitAmount: Joi.number().required().label("Limit"),
  annualCharge: Joi.number().allow(0).label("Annual  Charge"),
  status: Joi.string().required().trim().label("Status"),
});

const createUpdate = (input) => validate(input, createUpdateSchema);

module.exports = { createUpdate };
