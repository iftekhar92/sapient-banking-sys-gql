const mongoose = require("mongoose");
const moment = require("moment");

const Income = require("../models/Income");
const auth = require("./authentication");
const joi = require("../validation/income");
const commonFunc = require("./common");

module.exports = {
  create(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.authorization(false, context)) {
          const validation = joi.createUpdate(input);
          if (validation.error) {
            return resolve({
              error: validation.error,
              severity: "error bg",
              message: "Please fix fields in red below.",
            });
          } else {
            const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            const inputObj = {
              ...validation.value,
              createdAt: datetime,
              updatedAt: datetime,
            };
            return new Income(inputObj).save((error) => {
              if (error) {
                if (error.code && error.code === 11000) {
                  return resolve({
                    error: [
                      {
                        key: "name",
                        value: "Already in used!",
                      },
                    ],
                    severity: "error bg",
                    message: "Please fix fields in red below.",
                  });
                } else {
                  return resolve({
                    error: null,
                    severity: "error bg",
                    message: "Something went wrong!",
                  });
                }
              } else {
                return resolve({
                  error: null,
                  severity: "success bg",
                  message: "Record has been saved!",
                });
              }
            });
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            message: "Sorry, You are not authorized.",
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
  update(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.authorization(true, context)) {
          if (input._id) {
            const validation = joi.createUpdate(input);
            if (validation.error) {
              return resolve({
                error: validation.error,
                severity: "error bg",
                message: "Please fix fields in red below.",
              });
            } else {
              const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              const { _id, ...rest } = validation.value;
              const inputObj = {
                ...rest,
                updatedAt: datetime,
              };
              const { error } = await commonFunc.updateByAttributes(
                { _id: mongoose.Types.ObjectId(_id) },
                inputObj,
                Income
              );
              return resolve({
                error: null,
                severity: `${error ? "error" : "success"} bg`,
                message: `${
                  error
                    ? "Something went wrong!"
                    : "Record has been saved successfully."
                }`,
              });
            }
          } else {
            return resolve({
              error: null,
              severity: "info bg",
              message: "Sorry, You are not authorized.",
            });
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            message: "Sorry, You are not authorized.",
          });
        }
      } catch (ex) {
        return resolve({
          error: null,
          severity: "error bg",
          message: "Something went wrong!",
        });
      }
    });
  },
  removedById(_id, context) {
    return new Promise((resolve) => {
      try {
        if (auth.authorization(true, context)) {
          return Income.findOneAndDelete(
            { _id: mongoose.Types.ObjectId(_id) },
            (error) => {
              if (error)
                return resolve({
                  hasError: true,
                  message: "Sorry, request cann't be executed!",
                  severity: "error bg",
                });
              return resolve({
                hasError: false,
                message: "Record has been deleted successfully.",
                severity: "success bg",
              });
            }
          );
        } else {
          return resolve({
            hasError: true,
            message: "Sorry, request cann't be executed!",
            severity: "error bg",
          });
        }
      } catch (ex) {
        return resolve({
          hasError: true,
          message: "Sorry, request cann't be executed!",
          severity: "error bg",
        });
      }
    });
  },
  findById(_id, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.authorization(true, context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(_id) },
            Income
          );
          return resolve({ hasError: !!error, response: data });
        } else {
          return resolve({ hasError: true, response: {} });
        }
      } catch (ex) {
        console.error(ex)
        return resolve({ hasError: true, response: {} });
      }
    });
  },
  findAll(status) {
    return new Promise(async (resolve) => {
      try {
        const params = {
          match: {
            name: { $ne: "" },
            status: status
              ? { $regex: `^${status}`, $options: "i" }
              : { $ne: "" },
          },
          project: {
            _id: "$_id",
            name: "$name",
            from: "$from",
            to: "$to",
            range: {
              $concat: [
                "$name",
                "(",
                { $toString: "$from" },
                "INR",
                " to ",
                { $toString: "$to" },
                "INR",
                ")",
              ],
            },
            status: "$status",
          },
        };
        const { response } = await commonFunc.queryExecutor(params, Income);
        return resolve({ response });
      } catch (ex) {
        return resolve({ response: [] });
      }
    });
  },
  list(input, context) {
    return new Promise(async (resolve) => {
      if (auth.authorization(false, context)) {
        const {
          pageLimit,
          pageNo,
          search: { name = "", status = "" },
        } = input;
        const match = {
          name: name ? { $regex: `^${name}`, $options: "i" } : { $ne: "" },
          status: status
            ? { $regex: `^${status}`, $options: "i" }
            : { $ne: "" },
        };
        const project = {
          _id: "$_id",
          name: "$name",
          from: "$from",
          to: "$to",
          range: {
            $concat: [
              "$name",
              "(",
              { $toString: "$from" },
              "INR",
              " to ",
              { $toString: "$to" },
              "INR",
              ")",
            ],
          },
          status: "$status",
        };
        const addFields = {
          action: { view: false, edit: true, remove: true },
      };

        const limit = parseInt(pageLimit, 10);
        const page = parseInt(pageNo, 10);
        const skip = parseInt(limit * page, 10);

        const { total } = await commonFunc.totalItems(match, Income);
        const { response } = await commonFunc.queryExecutor(
          { match, project, addFields, skip, limit },
          Income
        );
        return resolve({ total, response });
      } else {
        return resolve({ total: 0, response: [] });
      }
    });
  },
};
