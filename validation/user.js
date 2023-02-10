const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const validate = require("./validate");

const dummyUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(150).required().trim().label("Name"),
  email: Joi.string().max(150).email().required().trim().label("Email Address"),
  userType: Joi.string()
    .valid("ADMIN", "CUSTOMER")
    .required()
    .trim()
    .label("User Type")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
  phone: Joi.string().required().label("Phone"),
  occupation: Joi.string().max(150).required().trim().label("Occupation"),
  address: Joi.string().max(200).required().trim().label("Residance"),
});

const signupSchema = Joi.object({
  _id: Joi.string().allow("").optional().label("Resource ID"),
  fullName: Joi.string().min(3).max(150).required().trim().label("Name"),
  email: Joi.string().max(150).email().required().trim().label("Email Address"),
  userType: Joi.string()
    .valid("ADMIN", "CUSTOMER")
    .required()
    .trim()
    .label("User Type")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
  phone: Joi.string().required().label("Phone"),
  fkIncomeId: Joi.string().required().trim().label("Income"),
  occupation: Joi.string().max(150).required().trim().label("Occupation"),
  address: Joi.string().max(200).required().trim().label("Residance"),
  fkGovId: Joi.string().required().trim().label("Govt ID"),
  govIdProof: Joi.string().required().label("Govt ID Proof"),
});
const validateTokenSchema = Joi.object({
  token: Joi.string().max(32).required().trim().label("Activation Token"),
});
const setPasswordSchema = Joi.object({
  token: Joi.string().max(32).required().trim().label("Token"),
  key: Joi.string().required().trim().label("Token Name"),
  password: Joi.string().min(6).max(18).required().trim().label("Password"),
  confirmPassword: Joi.string()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
});
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .min(6)
    .max(18)
    .required()
    .trim()
    .label("Old Password"),
  password: Joi.string().min(6).max(18).required().trim().label("Password"),
  confirmPassword: Joi.string()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email Address"),
  password: Joi.string().min(6).max(18).required().trim().label("Password"),
});
const emailWithKeySchema = Joi.object({
  email: Joi.string().email().required().label("Email Address"),
  key: Joi.string().required().label("Token name"),
});
const forgotPasswordSchema = Joi.object({
  forgotPasswordToken: Joi.string().required().trim().label("Resource ID"),
  password: Joi.string().min(6).max(18).required().trim().label("Password"),
  confirmPassword: Joi.string()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(150).required().trim().label("Name"),
  phone: Joi.string().required().label("Phone"),
  occupation: Joi.string().max(150).required().trim().label("Occupation"),
  profilePic: Joi.string().allow("").optional().label("Profile Pic"),
});

const dummyUser = (input) => validate(input, dummyUserSchema);
const signup = (input) => validate(input, signupSchema);
const emailWithKey = (input) => validate(input, emailWithKeySchema);
const setPassword = (input) => validate(input, setPasswordSchema);
const validateToken = (input) => validate(input, validateTokenSchema);
const changePassword = (input) => validate(input, changePasswordSchema);
const login = (input) => validate(input, loginSchema);
const forgotPassword = (input) => validate(input, forgotPasswordSchema);
const updateProfile = (input) => validate(input, updateProfileSchema);

module.exports = {
  dummyUser,
  signup,
  emailWithKey,
  setPassword,
  validateToken,
  changePassword,
  login,
  forgotPassword,
  updateProfile
};
