const mongoose = require("mongoose");
const moment = require("moment");
const randomstring = require("randomstring");
const isBase64 = require("is-base64");
const fileUpload = require("./FileUpload");

const User = require("../models/User");
const Income = require("../models/Income");
const ProofType = require("../models/ProofType");
const joi = require("../validation/user");
const commonFunc = require("./common");
const auth = require("./authentication");
const config = require("../config/constants");
const { sendMail } = require("./sendMail");
const { encrypt, decrypt, generateToken } = require("./encryption");

module.exports = {
  validateToken(token, key, Modal) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.validateToken({ token });
        if (validation.error)
          return resolve({ error: "Token cannot be blank.", data: null });
        const response = await commonFunc.findByAttribute(
          { [key]: token },
          Modal
        );
        return resolve(response);
      } catch (ex) {
        console.error(ex);
        return resolve({ error: "Something went wrong!", data: null });
      }
    });
  },
  dummyUser(input) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.dummyUser(input);
        if (validation.error) {
          return resolve({
            error: validation.error,
            severity: "error bg",
            message: "Please fix fields in red below.",
          });
        } else {
          const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          const code = randomstring.generate(32);
          const param = {
            sample: { size: 1 },
            project: {
              _id: "$_id",
            },
          };
          const { response: incomeRes } = await commonFunc.queryExecutor(
            param,
            Income
          );
          const { response: proofTypeRes } = await commonFunc.queryExecutor(
            param,
            ProofType
          );
          if (incomeRes.length > 0 && proofTypeRes.length > 0) {
            const inputObj = {
              ...validation.value,
              fkIncomeId: mongoose.Types.ObjectId(incomeRes[0]._id),
              fkGovId: mongoose.Types.ObjectId(proofTypeRes[0]._id),
              govIdProof: "",
              password: "",
              code,
              accountInfo: [],
              paymentHistory: [],
              status: "ACTIVE",
              createdAt: datetime,
              updatedAt: datetime,
            };
            return new User(inputObj).save((error) => {
              if (error) {
                if (error.code && error.code === 11000) {
                  return resolve({
                    error: [
                      {
                        key: "email",
                        value: "Already in used!",
                      },
                    ],
                    severity: "error",
                    message: "Please fix fields in red below.",
                  });
                } else {
                  return resolve({
                    error: null,
                    severity: "error",
                    message: "Something went wrong!",
                  });
                }
              } else {
                return resolve({
                  error: null,
                  severity: "success",
                  message:
                    "Account has been created successfully. Please set your password.",
                });
              }
            });
          } else {
            return resolve({
              error: null,
              severity: "error",
              message: "Please add Income and Proof Type first.",
            });
          }
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error",
          message: "Something went wrong!",
        });
      }
    });
  },
  signup(input) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.signup(input);
        if (validation.error) {
          return resolve({
            error: validation.error,
            severity: "error bg",
            message: "Please fix fields in red below.",
            token: "",
          });
        } else {
          const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          const code = randomstring.generate(32);
          const inputObj = {
            ...validation.value,
            password: "",
            code,
            accountInfo: [],
            paymentHistory: [],
            status: "ACTIVE",
            createdAt: datetime,
            updatedAt: datetime,
          };
          // Inject image
          if (isBase64(inputObj.govIdProof, { mimeRequired: true })) {
            const filenameWithoutExt = randomstring.generate({
              ...config.filenameConvention,
              length: 8,
            });
            const { filename } = await fileUpload.uploadImage(
              inputObj.govIdProof,
              "public/images/govtProof",
              filenameWithoutExt
            );
            if (filename) {
              inputObj.govIdProof = filename;
            } else {
              inputObj.govIdProof = "";
            }
          }
          return new User(inputObj).save(async (error, data) => {
            if (error) {
              if (error.code && error.code === 11000) {
                return resolve({
                  error: [
                    {
                      key: "email",
                      value: "Already in used!",
                    },
                  ],
                  severity: "error bg",
                  message: "Please fix fields in red below.",
                  token: "",
                });
              } else {
                return resolve({
                  error: null,
                  severity: "error bg",
                  message: "Something went wrong!",
                  token: "",
                });
              }
            } else {
              const options = {
                from: config.FROM,
                to: data.email,
                template: "setPassword",
                context: {
                  subject: config.SET_PASSWORD_SUBJECT,
                  greeting: data.fullName.split(" ")[0],
                  fullName: data.fullName,
                  link: `${config.SITE_URL}set-password/${data.code}`,
                  company: config.COMPANY,
                },
              };
              await sendMail(options);
              return resolve({
                error: null,
                token: data.code,
                severity: "success bg",
                message:
                  "Account has been created successfully. Please check inbox of click {here} to set password.",
              });
            }
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error bg",
          message: "Something went wrong!",
          token: "",
        });
      }
    });
  },
  getTokenToSetPassword(input) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.emailWithKey(input);
        if (validation.error) {
          return resolve({
            error: validation.error,
            token: "",
            severity: "error bg",
            message: "Please fix fields in red below.",
          });
        } else {
          const { email, key } = validation.value;
          if (key === "forgotPasswordToken") {
            const code = randomstring.generate(32);
            const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            await commonFunc.updateByAttributes(
              { email },
              { forgotPasswordToken: code, updatedAt: datetime },
              User
            );
          }
          const { error, data } = await commonFunc.findByAttribute(
            { email },
            User
          );
          if (!error && data) {
            const options = {
              from: config.FROM,
              to: data.email,
              template: "setPassword",
              context: {
                subject: config.SET_PASSWORD_SUBJECT,
                greeting: data.fullName.split(" ")[0],
                fullName: data.fullName,
                link: `${config.SITE_URL}${key === "code" ? "set" : "forgot"}/${
                  data[key]
                }/password/${data[key]}`,
                company: config.COMPANY,
              },
            };
            await sendMail(options);
            return resolve({
              error: null,
              token: data[key],
              severity: "success bg",
              message:
                "Password reset link has sent on email. Please check Inbox or click {here} to reset password.",
            });
          } else {
            return resolve({
              error: null,
              token: "",
              severity: "error bg",
              message: "Account does not exist!",
            });
          }
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          token: "",
          severity: "error bg",
          message: "Something went wrong!",
        });
      }
    });
  },
  setPassword(input) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.setPassword(input);
        if (validation.error)
          return resolve({
            error: validation.error,
            message: "Please fix fields in red below.",
            severity: "error bg",
          });
        const { token, key, password } = validation.value;
        const { error, data } = await this.validateToken(token, key, User);
        if (!error && data) {
          const code = randomstring.generate(32);
          const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          const encPassword = encrypt(password, code);
          const options = {
            password: encPassword,
            code,
            updatedAt: datetime,
          };
          if (key === "forgotPasswordToken") {
            options.forgotPasswordToken = "";
          }
          const { error: err } = await commonFunc.updateByAttributes(
            { _id: data._id },
            options,
            User
          );
          if (err) {
            return resolve({
              error: [
                { key: "password", value: "" },
                { key: "confirmPassword", value: "" },
              ],
              message: "Some thing went wrong!",
              severity: "error bg",
            });
          } else {
            return resolve({
              error: null,
              message: "Password has been set successfully",
              severity: "success bg",
            });
          }
        } else {
          return resolve({
            error: [{ key: "code", value: "Token is invalid" }],
            message: "Token is invalid",
            severity: "error bg",
          });
        }
      } catch (ex) {
        console.error(ex);
      }
    });
  },
  login(input) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.login(input);
        if (validation.error)
          return resolve({
            error: validation.error,
            message: "Credentials are incorrect",
            severity: "error bg",
            response: null,
            token: "",
          });

        const { error, data } = await commonFunc.findByAttribute(
          { email: validation.value.email },
          User
        );
        if (error || !data)
          return resolve({
            error: [
              {
                key: "email",
                value: "Email Address does not exists",
              },
              { key: "password", value: "" },
            ],
            message: "User does not exist",
            severity: "error bg",
            response: null,
            token: "",
          });
        if (
          !data.password ||
          decrypt(data.password, data.code) !== validation.value.password
        )
          return resolve({
            error: [
              { key: "email", value: "" },
              { key: "password", value: "Password mismatch" },
            ],
            message: "Password is incorrect",
            severity: "error bg",
            response: null,
            token: "",
          });
        if (data.status !== "ACTIVE")
          return resolve({
            error: [
              { key: "email", value: "" },
              { key: "password", value: "" },
            ],
            message:
              "Sorry, Your account is not active. Please contact to administrator",
            severity: "info bg",
            response: null,
            token: "",
          });
        return resolve({
          error: null,
          message: "User logged in successfully",
          response: data,
          severity: "success bg",
          token: generateToken(data._id),
        });
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          message: "Something went wrong!",
          severity: "error bg",
          response: null,
          token: "",
        });
      }
    });
  },
  changePassword(input, context) {
    return new Promise(async (resolve) => {
      try {
        const validation = joi.changePassword(input);
        if (validation.error) {
          return resolve({
            error: validation.error,
            message: "Please fix fields in red below.",
            severity: "error bg",
          });
        } else {
          const { error, data } = await commonFunc.findByAttribute(
            {
              _id: mongoose.Types.ObjectId(context.user._id),
            },
            User
          );
          if (error) {
            return resolve({
              error: null,
              message: "Something went wrong! while fetching record.",
              severity: "error bg",
            });
          }
          if (!error && data) {
            const { oldPassword, password } = validation.value;
            if (decrypt(data.password, data.code) === oldPassword) {
              const code = randomstring.generate(32);
              const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              const encPassword = encrypt(password, code);
              const options = {
                password: encPassword,
                code,
                updatedAt: datetime,
              };

              const { error: err } = await commonFunc.updateByAttributes(
                { _id: mongoose.Types.ObjectId(data._id) },
                options,
                User
              );
              if (err) {
                return resolve({
                  error: [
                    { key: "password", value: "" },
                    { key: "confirmPassword", value: "" },
                  ],
                  message: "Some thing went wrong! while updating record.",
                  severity: "error bg",
                });
              } else {
                return resolve({
                  error: null,
                  message: "Password has been updated successfully",
                  severity: "success bg",
                });
              }
            } else {
              return resolve({
                error: null,
                message: "Mismatch your old password!",
                severity: "error bg",
              });
            }
          } else {
            return resolve({
              error: null,
              message: "Something went wrong! while fetching record.",
              severity: "error bg",
            });
          }
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          message: "Something went wrong!",
          severity: "error bg",
        });
      }
    });
  },
  updateProfile(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const validation = joi.updateProfile(input);
          if (validation.error) {
            return resolve({
              error: validation.error,
              severity: "error bg",
              message: "Please fix fields in red below.",
            });
          } else {
            // Inject image
            if (isBase64(validation.value.profilePic, { mimeRequired: true })) {
              const filenameWithoutExt = randomstring.generate({
                ...config.filenameConvention,
                length: 8,
              });
              const { filename } = await fileUpload.uploadImage(
                validation.value.profilePic,
                "public/images/profile",
                filenameWithoutExt
              );
              if (filename) {
                validation.value.profilePic = filename;
              } else {
                validation.value.profilePic = "";
              }
            }

            const { error } = await commonFunc.updateByAttributes(
              { _id: mongoose.Types.ObjectId(context.user._id) },
              {
                ...validation.value,
                updatedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
              },
              User
            );
            if (error) {
              return resolve({
                error: null,
                severity: "error bg",
                message: "Something went wrong while updating record.",
              });
            } else {
              return resolve({
                error: null,
                severity: "success bg",
                message: "Record has been updated successfully.",
              });
            }
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            message: "Sorry, you are not authorized.",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error bg",
          message: "Something went wrong!",
        });
      }
    });
  },
  findDetail(context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              response: null,
            });
          } else {
            const {
              _id,
              fullName,
              email,
              phone,
              fkIncomeId,
              occupation,
              address,
              profilePic,
            } = data;
            return resolve({
              response: {
                _id,
                fullName,
                email,
                phone,
                fkIncomeId,
                occupation,
                address,
                profilePic,
              },
            });
          }
        } else {
          return resolve({ response: null });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          response: null,
        });
      }
    });
  },
};
