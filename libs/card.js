const mongoose = require("mongoose");
const moment = require("moment");
const asyncLoop = require("node-async-loop");

const Card = require("../models/Card");
const CardType = require("../models/CardType");
const Income = require("../models/Income");
const auth = require("./authentication");
const joi = require("../validation/card");
const commonFunc = require("./common");
const config = require("../config/constants");

module.exports = {
  create(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.authorization(true, context)) {
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
            return new Card(inputObj).save((error) => {
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
                Card
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
          return Card.findOneAndDelete(
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
  findById(_id) {
    return new Promise(async (resolve) => {
      try {
        const { error, data } = await commonFunc.findByAttribute(
          { _id: mongoose.Types.ObjectId(_id) },
          Card
        );
        return resolve({ hasError: !!error, response: data });
      } catch (ex) {
        return resolve({ hasError: true, response: {} });
      }
    });
  },
  availableCards(status, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user.fkIncomeId) },
            Income
          );
          if (!error && data) {
            const params = {
              match: {
                name: { $ne: "" },
                status: status
                  ? { $regex: `^${status}`, $options: "i" }
                  : { $ne: "" },
              },
              lookup: {
                from: "incomes",
                localField: "fkIncomeId",
                foreignField: "_id",
                as: "incomes",
              },
              unwind: "$incomes",
              matchCallback: { "incomes.to": { $lte: parseInt(data.to, 10) } },
              project: {
                _id: "$_id",
                name: "$name",
                fkIncomeId: "$fkIncomeId",
                fkIncomeFrom: "$incomes.from",
                fkIncomeTo: "$incomes.to",
                fkAccountTypeId: "$fkAccountTypeId",
                fkCardTypeId: "$fkCardTypeId",
                validityNoOfYear: "$validityNoOfYear",
                limitAmount: "$limitAmount",
                annualCharge: "$annualCharge",
                status: "$status",
              },
            };
            const { response: res } = await commonFunc.queryExecutor(
              params,
              Card
            );
            const response = {
              creditCard: res.filter(
                (x) =>
                  !x?.name
                    ?.toLowerCase()
                    ?.includes(config?.DEBIT_CARD?.toLowerCase())
              ),
              debitCard: res.filter((x) =>
                x?.name
                  ?.toLowerCase()
                  ?.includes(config?.DEBIT_CARD?.toLowerCase())
              ),
            };
            return resolve({ response });
          } else {
            return resolve({ response: {} });
          }
        } else {
          console.info("Sorry, request cann't be executed!");
          return resolve({ response: {} });
        }
      } catch (ex) {
        return resolve({ response: {} });
      }
    });
  },
  list(input) {
    return new Promise(async (resolve) => {
      const {
        pageLimit,
        pageNo,
        search: { name = "", status = "" },
      } = input;
      const match = {
        name: name ? { $regex: `^${name}`, $options: "i" } : { $ne: "" },
        status: status ? { $regex: `^${status}`, $options: "i" } : { $ne: "" },
      };
      const lookup = {
        from: "accounttypes",
        localField: "fkAccountTypeId",
        foreignField: "_id",
        as: "accountType",
      };
      const unwind = "$accountType";
      const project = {
        _id: "$_id",
        id: "$id",
        name: "$name",
        fkIncomeId: "$fkIncomeId",
        fkAccountTypeId: "$fkAccountTypeId",
        accountType: "$accountType.name",
        fkCardTypeId: "$fkCardTypeId",
        validityNoOfYear: {
          $concat: [{ $toString: "$validityNoOfYear" }, " Year(s)"],
        },
        limitAmount: "$limitAmount",
        annualCharge: "$annualCharge",
        status: "$status",
      };
      const addFields = {
        action: { view: false, edit: true, remove: true },
      };

      const limit = parseInt(pageLimit, 10);
      const page = parseInt(pageNo, 10);
      const skip = parseInt(limit * page, 10);

      const { total } = await commonFunc.totalItems(match, Card);
      const { response } = await commonFunc.queryExecutor(
        { match, project, addFields, lookup, unwind, skip, limit },
        Card
      );
      if (response.length > 0) {
        const arrData = [];
        return asyncLoop(
          response,
          async (item, next) => {
            const { data } = await commonFunc.findByAttribute(
              { _id: mongoose.Types.ObjectId(item.fkCardTypeId) },
              CardType
            );
            const { data: incomeData } = await commonFunc.findByAttribute(
              { _id: mongoose.Types.ObjectId(item.fkIncomeId) },
              Income
            );
            arrData.push({
              ...item,
              cardType: data && data.name ? data.name : "",
              annualIncome: incomeData
                ? `${incomeData.name} (INR${incomeData.from} to INR${incomeData.to})`
                : "",
            });
            next();
          },
          () => resolve({ total, response: arrData })
        );
      } else {
        resolve({ total, response: [] });
      }
    });
  },
};
