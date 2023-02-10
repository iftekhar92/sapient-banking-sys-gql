const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));

const config = require("../config/constants");
const validate = require("./validate");

const openAccountSchema = Joi.object({
  fkAccountTypeId: Joi.string().required().trim().label("Account Type"),
  fkSavingsAccountId: Joi.string().allow("").optional().label("Saving Account"),
  fkCardId: Joi.string().allow("").optional().label("Card"),
  type: Joi.string()
    .valid(config.SAVINGS, config.CREDIT_CARD)
    .required()
    .trim()
    .label("Open Account type")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
});
const makeTransactionSchema = Joi.object({
  txnType: Joi.string().required().trim().label("Transaction Type"),
  fkAccountTypeId: Joi.string().required().trim().label("Account Type"),
  fkCardId: Joi.string().allow("").optional().label("Card"),
  fkSavingsAccountId: Joi.string()
    .allow("")
    .optional()
    .label("Savings Account"),
  amount: Joi.number().required().label("Amount"),
  remark: Joi.string().allow("").optional().label("Remark"),
  paymentAt: Joi.object().allow("").optional().label("Payment At"),
});

const openAccount = (input) => validate(input, openAccountSchema);
const makeTransaction = (input) => validate(input, makeTransactionSchema);

module.exports = { openAccount, makeTransaction };
